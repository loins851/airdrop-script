import csvParser from "csv-parser";
import fs from "fs";
import process from "process";

import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
  u64,
} from "@solana/spl-token";

import { getTxSize } from "../utils/get-tx-size";
import BigNumber from "bignumber.js";

/**
 * Note:
 * Flow of script:
 * - read data from a file
 * - transfer token
 * - write data to other file
 *
 * Fail when running:
 * - data will be continue appended to result file after running again
 * - need manually delete rows, which were run in file data
 */
export const distributeTokenInBatch = async (
  payer: Keypair,
  rpcEndpoint: string,
  mintTokenAccount: PublicKey,
  inputFilePath: string,
  resultFilePath: string
) => {
  const userExisted = new Map<string, boolean>();
  const connection = new Connection(rpcEndpoint, "confirmed");

  const mintTokenInfo = await connection.getParsedAccountInfo(mintTokenAccount);
  if (mintTokenInfo.value == null) return;
  const decimals = (mintTokenInfo.value.data as any).parsed.info.decimals;

  const distributorAssociatedTokenAccount =
    await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      mintTokenAccount,
      payer.publicKey,
      true
    );

  const readableStream = fs.createReadStream(inputFilePath);
  const parser = csvParser();
  readableStream.pipe(parser);

  let isResultFileExisted = fs.existsSync(resultFilePath) ? true : false;
  const writableStream = fs.createWriteStream(resultFilePath, { flags: "a+" });

  if (!isResultFileExisted) {
    writableStream.write(
      ["id", "wallet", "amount", "tx_sig"].toString() + "\n"
    );
  }

  const fileData: {
    id: string;
    wallet: string;
    amount: number;
  }[] = [];

  parser.on(
    "data",
    async (data: { id: string; wallet: string; amount: number }) => {
      if (data.amount == 0 || !data.wallet) return;
      fileData.push({
        id: data.id,
        wallet: data.wallet,
        amount: data.amount,
      });
    }
  );
  parser.on("end", async () => {
    const batchSize = 10;
    for (let i = 0; i < fileData.length; i += batchSize) {
      const batchData = fileData.slice(i, i + batchSize);

      const tx = new Transaction();

      for (let j = 0; j < batchData.length; j++) {
        let data = batchData[j];

        const uiAmountBigNumber = new BigNumber(data.amount);
        const amount = uiAmountBigNumber.times(new BigNumber(10).pow(decimals));
        console.log("Processing with ", {
          idx: i + j + 1,
          id: data.id,
          wallet: data.wallet,
          amount: data.amount,
        });

        const receiver = new PublicKey(data.wallet);

        const receiverAssociatedTokenAccount =
          await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            mintTokenAccount,
            receiver,
            true
          );

        if (!userExisted.has(receiver.toBase58())) {
          const associatedAccountInfo = await connection.getAccountInfo(
            receiverAssociatedTokenAccount,
            "confirmed"
          );
          if (associatedAccountInfo == null) {
            tx.add(
              Token.createAssociatedTokenAccountInstruction(
                ASSOCIATED_TOKEN_PROGRAM_ID,
                TOKEN_PROGRAM_ID,
                mintTokenAccount,
                receiverAssociatedTokenAccount,
                receiver,
                payer.publicKey
              )
            );
          }
          userExisted.set(receiver.toBase58(), true);
        }

        tx.add(
          Token.createTransferInstruction(
            TOKEN_PROGRAM_ID,
            distributorAssociatedTokenAccount,
            receiverAssociatedTokenAccount,
            payer.publicKey,
            [],
            new u64(amount.toString())
          )
        );
      }
      tx.recentBlockhash = (
        await connection.getLatestBlockhash("finalized")
      ).blockhash;
      tx.feePayer = payer.publicKey;
      console.log("Tx size", getTxSize(tx, payer.publicKey));
      const txSig = await sendAndConfirmTransaction(connection, tx, [payer]);

      for (let j = 0; j < batchData.length; j++) {
        let data = batchData[j];
        writableStream.write(
          [data.id, data.wallet, data.amount, txSig].toString() + "\n"
        );

        console.log("Success transfer with ", {
          idx: i + j + 1,
          id: data.id,
          wallet: data.wallet,
          amount: data.amount,
          txSig,
        });
      }
    }
  });
  parser.on("error", (error) => {
    console.error("Error reading CSV file:", error);
  });

  writableStream.on("error", (error) => {
    console.error("Error writing CSV file:", error);
  });
};
