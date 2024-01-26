import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
  u64,
} from "@solana/spl-token";
import { BN } from "bn.js";
import * as bs58 from "bs58";
import { getTxSize } from "../utils/get-tx-size";
require("dotenv").config();

const main = async () => {
  const payer = Keypair.fromSecretKey(
    bs58.decode(process.env.PRIVATE_KEY_BASE58 || "")
  );

  const rpcEndpoint =
    process.env.RPC_ENDPOINT || "https://api-testnet.renec.foundation:8899"; // https://api-mainnet-beta.renec.foundation:8899
  const connection = new Connection(rpcEndpoint, "confirmed");

  const mintTokenAccount = new PublicKey(
    process.env.MINT_TOKEN_ACCOUNT ||
      ""
  );

  const mintTokenInfo = await connection.getParsedAccountInfo(mintTokenAccount);
  if (mintTokenInfo.value == null) return;
  const decimals = (mintTokenInfo.value.data as any).parsed.info.decimals;

  const receiver = payer.publicKey;
  // const receiver = new PublicKey('');

  const associatedTokenAccount = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mintTokenAccount,
    receiver,
    true
  );

  let account = await connection.getAccountInfo(
    associatedTokenAccount,
    "confirmed"
  );
  const tx = new Transaction();

  if (account == null) {
    tx.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mintTokenAccount,
        associatedTokenAccount,
        receiver,
        payer.publicKey
      )
    );
  }
  const uiAmount = new u64("100000000");
  const amount = uiAmount.mul(new BN(10).pow(new BN(decimals)));
  tx.add(
    Token.createMintToInstruction(
      TOKEN_PROGRAM_ID,
      mintTokenAccount,
      associatedTokenAccount,
      payer.publicKey,
      [],
      new u64(amount.toString())
    )
  );

  const txSig = await connection.sendTransaction(tx, [payer]);

  console.log({ txSig });
};

try {
  main();
} catch (error) {
  console.log(error);
}
