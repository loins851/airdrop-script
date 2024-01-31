import { Keypair } from "@solana/web3.js";
import * as bs58 from "bs58";

export const convertKeyPairFromArrayType = async (payer: Keypair) => {
  console.log({ payer });
  console.log(payer.publicKey);
  console.log(payer.publicKey.toBase58());
  console.log("===");
  console.log(payer.secretKey);
  // console.log(bs58.encode([]))
  console.log(bs58.encode(payer.secretKey));
  // console.log(bs58.decode(''))
  console.log(bs58.decode(bs58.encode(payer.secretKey)));
};
