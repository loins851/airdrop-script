import { Keypair } from "@solana/web3.js";
import * as bs58 from "bs58";

export const convertKeyPairFromBs58Type = async (keypair: string) => {
console.log({keypair})
console.log(bs58.decode(keypair))
};
