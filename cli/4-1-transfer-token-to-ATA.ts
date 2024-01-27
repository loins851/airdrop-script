import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
  u64,
} from "@solana/spl-token";
import BigNumber from "bignumber.js";

export const transferTokenToATA = async (
  payer: Keypair,
  rpcEndpoint: string,
  mintTokenAccount: PublicKey,
  receiver: PublicKey,
  uiAmount: number
) => {
  const connection = new Connection(rpcEndpoint, "confirmed");

  const mintTokenInfo = await connection.getParsedAccountInfo(mintTokenAccount);
  if (mintTokenInfo.value == null) return;
  const decimals = (mintTokenInfo.value.data as any).parsed.info.decimals;

  const payerAssociatedTokenAccount = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mintTokenAccount,
    payer.publicKey,
    true
  );

  const receiverAssociatedTokenAccount = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mintTokenAccount,
    receiver,
    true
  );

  let account = await connection.getAccountInfo(
    receiverAssociatedTokenAccount,
    "confirmed"
  );
  const tx = new Transaction();

  if (account == null) {
    tx.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mintTokenAccount,
        receiverAssociatedTokenAccount,
        receiver,
        payer.publicKey
      )
    );
  }

  const uiAmountBigNumber = new BigNumber(uiAmount);
  const amount = uiAmountBigNumber.times(new BigNumber(10).pow(decimals));
  tx.add(
    Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      payerAssociatedTokenAccount,
      receiverAssociatedTokenAccount,
      payer.publicKey,
      [],
      new u64(amount.toString())
    )
  );

  const txSig = await connection.sendTransaction(tx, [payer]);

  console.log({ txSig });
};
