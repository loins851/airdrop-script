import { Keypair } from "@solana/web3.js";
import * as bs58 from "bs58";
require("dotenv").config();

const main = async () => {
  const secretKeyBase58 = process.env.PRIVATE_KEY_BASE58 || "";

  const secretKey = bs58.decode(secretKeyBase58);

  const secretKeyBase58Clone = bs58.encode(secretKey);

  const payer = Keypair.fromSecretKey(secretKey);

  console.log({ secretKey });
  console.log({ secretKeyBase58Clone });
  console.log(payer);
};

try {
  main();
} catch (error) {
  console.log(error);
}
