import { Connection, Keypair } from "@solana/web3.js";

import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as bs58 from "bs58";
require("dotenv").config();

const main = async () => {
  const payer = Keypair.fromSecretKey(
    bs58.decode(process.env.PRIVATE_KEY_BASE58 || "")
  );

  const rpcEndpoint =
    process.env.RPC_ENDPOINT || "https://api-testnet.renec.foundation:8899"; // https://api-mainnet-beta.renec.foundation:8899
  const connection = new Connection(rpcEndpoint, "confirmed");

  const mint = await Token.createMint(
    connection,
    payer,
    payer.publicKey,
    null,
    9,
    TOKEN_PROGRAM_ID
  );

  console.log(mint.publicKey);
  console.log(mint.publicKey.toBase58());
  console.log(mint.publicKey.toBuffer());
  console.log(mint.publicKey.toBytes());
  console.log(mint.publicKey.toString());
};

try {
  main();
} catch (error) {
  console.log(error);
}
