import { Connection, Keypair } from "@solana/web3.js";

import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const createRandomToken = async (
  payer: Keypair,
  rpcEndpoint: string,
  tokenDecimals: number
) => {
  const connection = new Connection(rpcEndpoint, "confirmed");

  const mint = await Token.createMint(
    connection,
    payer,
    payer.publicKey,
    null,
    tokenDecimals,
    TOKEN_PROGRAM_ID
  );

  console.log(mint.publicKey);
  console.log(mint.publicKey.toBase58());
  console.log(mint.publicKey.toBuffer());
  console.log(mint.publicKey.toBytes());
  console.log(mint.publicKey.toString());
};
