import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as bs58 from "bs58";
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
      "GRwYPgoBDGqoCCKdfG141RiFUXnxsCCMDTx5irXXfdXm"
  );
  const receiver = Keypair.generate();

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
    receiver.publicKey,
    true
  );

  let account = await connection.getAccountInfo(
    receiverAssociatedTokenAccount,
    "confirmed"
  );
  console.log(account);
  const tx = new Transaction();

  if (account == null) {
    tx.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mintTokenAccount,
        receiverAssociatedTokenAccount,
        receiver.publicKey,
        payer.publicKey
      )
    );
  }

  tx.add(
    Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      payerAssociatedTokenAccount,
      receiverAssociatedTokenAccount,
      payer.publicKey,
      [],
      10
    )
  );

  const txSig = await connection.sendTransaction(tx, [payer]);

  console.log(receiver.publicKey);
  console.log(receiverAssociatedTokenAccount);
  console.log({ txSig });
};

try {
  main();
} catch (error) {
  console.log(error);
}
