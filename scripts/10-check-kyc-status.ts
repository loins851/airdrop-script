require("dotenv").config();

import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import * as bs58 from "bs58";
import {
  Context,
  KYC_PROGRAM_ID_MAINNET,
  ProviderClient,
} from "@renec-foundation/kyc-sdk";
import { AnchorProvider, Program, Wallet } from "@project-serum/anchor";

const main = async () => {
  const rpcEndpoint =
    process.env.RPC_ENDPOINT || "https://api-testnet.renec.foundation:8899"; // https://api-mainnet-beta.renec.foundation:8899
  const connection = new Connection(rpcEndpoint, "confirmed");

  const publicKey = new PublicKey("");

  const wallet = new Wallet(Keypair.generate());
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  const ctx = Context.withProvider(
    provider,
    new PublicKey(KYC_PROGRAM_ID_MAINNET)
  );

  const providerClient = await ProviderClient.getClient(ctx);

  console.log(await providerClient.getCurrentUserKyc(publicKey));
};

try {
  main();
} catch (error) {
  console.log(error);
}
