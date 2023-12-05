import csvParser from "csv-parser";
import fs from "fs";
import process from "process";
require("dotenv").config();

import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

const main = async () => {
  const rpcEndpoint =
    process.env.RPC_ENDPOINT || "https://api-testnet.renec.foundation:8899"; // https://api-mainnet-beta.renec.foundation:8899
  const connection = new Connection(rpcEndpoint, "confirmed");

  // reUSD or PROP
  const mintTokenAccount = new PublicKey(
    process.env.MINT_TOKEN_ACCOUNT ||
      ""
  );
  const mintTokenInfo = await connection.getParsedAccountInfo(mintTokenAccount);
  if (mintTokenInfo.value == null) return;

  const filePath = process.cwd() + "/data/propeasy/batch2_remain_user - batch2_remain_user.csv";
  const readableStream = fs.createReadStream(filePath);
  const parser = csvParser();
  readableStream.pipe(parser);

  const fileData: {
    email: string;
    wallet_address: string;
    airdrop_before: string;
  }[] = [];

  parser.on(
    "data",
    async (data: {
      email: string;
      wallet_address: string;
      airdrop_before: string;
    }) => {
      if (!data.wallet_address || data.wallet_address == '0') return;
      fileData.push({
        email: data.email,
        wallet_address: data.wallet_address,
        airdrop_before: data.airdrop_before,
      });
    }
  );

  parser.on("end", async () => {
    for (let i = 0; i < fileData.length; i += 1) {
      if (fileData[i].airdrop_before == "TRUE") {
        console.log(i);
        continue;
      }

      const tokenAccounts = await connection.getTokenAccountsByOwner(
        new PublicKey(fileData[i].wallet_address),
        {
          programId: TOKEN_PROGRAM_ID,
          mint: mintTokenAccount,
        }
      );

      if (tokenAccounts.value.length > 0) {
        console.log(i, fileData[i].email, fileData[i].wallet_address);
        console.log(tokenAccounts);

        // const signatures = await connection.getSignaturesForAddress(tokenAddress, {
        //   limit: 1000, // Adjust the limit to fetch more transactions
        // });

      } else {
        console.log(i);
      }
    }
  });
};

try {
  main();
} catch (error) {
  console.log(error);
}
