import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
  AccountLayout,
  u64,
} from "@solana/spl-token";
import BigNumber from "bignumber.js";

export const transferTokenToNonATA = async (
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

  // transfer to non ATA
  const receiverTokenAccount = Keypair.generate();
  const tx = new Transaction();

  const lamportsForTokenAccount =
    await connection.getMinimumBalanceForRentExemption(AccountLayout.span);

  const uiAmountBigNumber = new BigNumber(uiAmount);
  const amount = uiAmountBigNumber.times(new BigNumber(10).pow(decimals));
  tx.add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      lamports: lamportsForTokenAccount,
      newAccountPubkey: receiverTokenAccount.publicKey,
      programId: TOKEN_PROGRAM_ID,
      space: AccountLayout.span,
    }),

    Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      mintTokenAccount,
      receiverTokenAccount.publicKey,
      receiver
    ),

    Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      payerAssociatedTokenAccount,
      receiverTokenAccount.publicKey,
      payer.publicKey,
      [],
      new u64(amount.toString())
    )
  );

  const txSig = await connection.sendTransaction(tx, [
    payer,
    receiverTokenAccount,
  ]);

  console.log("=============================");
  console.log(receiverTokenAccount.secretKey);
  console.log(receiverTokenAccount.publicKey);
  console.log(txSig);
};
