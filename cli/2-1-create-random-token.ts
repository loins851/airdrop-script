import { Connection, Keypair } from "@solana/web3.js";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import fs from "fs";

export const createRandomToken = async (
  payer: Keypair,
  rpcEndpoint: string,
  tokenDecimals: number
) => {
  const connection = new Connection(rpcEndpoint, "confirmed");

  const writableStream = fs.createWriteStream(
    "./data_test/2-1-create-random-token.txt",
    { flags: "a+" }
  );

  const mint = await Token.createMint(
    connection,
    payer,
    payer.publicKey,
    null,
    tokenDecimals,
    TOKEN_PROGRAM_ID
  );

  console.log(mint.publicKey.toBase58());
  writableStream.write(mint.publicKey.toBase58() + "\n");
};
