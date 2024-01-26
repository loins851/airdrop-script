import process from "process";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

require("dotenv").config();

const main = async () => {
  const rpcEndpoint =
    process.env.RPC_ENDPOINT || "https://api-testnet.renec.foundation:8899"; // https://api-mainnet-beta.renec.foundation:8899
  const connection = new Connection(rpcEndpoint, "confirmed");
  const mintTokenAccount = new PublicKey(process.env.MINT_TOKEN_ACCOUNT || "");

  const topHolders = (
    await connection.getTokenLargestAccounts(mintTokenAccount)
  ).value;

  const totalSupply = 100000000;
  let nonCirculatingAmount = 0;
  for (let i = 0; i < 3; i++) {
    nonCirculatingAmount += (topHolders[i] as any).uiAmount;
  }
  const circulatingAmount = totalSupply - nonCirculatingAmount;
  console.log(circulatingAmount);
};

try {
  main();
} catch (error) {
  console.log(error);
}
