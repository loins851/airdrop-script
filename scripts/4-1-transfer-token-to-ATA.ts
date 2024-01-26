import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
  u64,
} from "@solana/spl-token";
import * as bs58 from "bs58";
import BN from "bn.js";
require("dotenv").config();

const main = async () => {
  const payer = Keypair.fromSecretKey(
    bs58.decode(process.env.PRIVATE_KEY_BASE58 || "")
  );

  const rpcEndpoint =
    process.env.RPC_ENDPOINT || "https://api-testnet.renec.foundation:8899"; // https://api-mainnet-beta.renec.foundation:8899
  const connection = new Connection(rpcEndpoint, "confirmed");

  const mintTokenAccount = new PublicKey(process.env.MINT_TOKEN_ACCOUNT || "");
  const receiver = new PublicKey("");

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

  const uiAmount = new u64(20000000);
  const amount = uiAmount.mul(new BN(10).pow(new BN(9)));
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

  console.log(receiver);
  console.log(receiverAssociatedTokenAccount);
  console.log({ txSig });
};

try {
  main();
} catch (error) {
  console.log(error);
}
