import { BorshEventCoder } from "@project-serum/anchor";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { PropeasyIDL } from "@renec-foundation/propeasy-sdk";
import BigNumber from "bignumber.js";
import csvParser from "csv-parser";
import fs from "fs";

const txTypes = ["PurchasePropertyToken", "ClaimPropertyToken"];

export const countTxRelateToPropeasy = async (
  programId: PublicKey,
  rpcEndpoint: string,
  resultFilePath: string
) => {
  const connection = new Connection(rpcEndpoint, "confirmed");
  const eventCoder = new BorshEventCoder(PropeasyIDL as any);

  let lastSignature: string | undefined;

  let txTypeCnt = {
    purchase: 0,
    claim: 0,
    util: 0,
    error: 0,
  };

  const userPurchasedExisted = new Map<string, boolean>();
  let uniqueUserPurchasedCnt = 0;
  let txSigInfosCnt = 0;
  let totalCommissionAmount = 0;
  let breakCnt = 0;

  // let isResultFileExisted = fs.existsSync(resultFilePath) ? true : false;
  // const writableStream = fs.createWriteStream(resultFilePath, { flags: "a+" });

  // if (!isResultFileExisted) {
  //   writableStream.write(
  //     [
  //       "user",
  //       "property_state",
  //       "property_mint_account",
  //       "token_price",
  //       "sale_type",
  //       "purchased_amount",
  //       "property_amount",
  //       "purchased_timestamp",
  //       "referrer",
  //       "individual_commission_amount",
  //       "tx_sig",
  //     ].toString() + "\n"
  //   );
  // }

  while (true) {
    // get maximum 1000 tx signature related to program
    const txSigInfos = await connection.getSignaturesForAddress(programId, {
      before: lastSignature,
    });

    txSigInfosCnt += txSigInfos.length;
    console.log({ txSigInfosCntTmp: txSigInfosCnt });

    // for (const [idx, txSigInfo] of txSigInfos.entries()) {
    //   const tx = await connection.getParsedTransaction(
    //     txSigInfo.signature,
    //     "finalized"
    //   );

    //   console.log("processing with", idx, txSigInfo.signature);

    //   if (tx?.meta?.err) {
    //     txTypeCnt.error += 1;
    //     console.log(tx.meta.logMessages);
    //   } else {
    //     if (tx?.meta?.logMessages) {
    //       const eventLog = getEventLog(tx.meta.logMessages, programId);
    //       if (
    //         checkTxType(tx.meta.logMessages) == "PurchasePropertyToken" &&
    //         eventLog != ""
    //       ) {
    //         const decodedEventLog = eventCoder.decode(eventLog) as any;
    //         // console.log("Processing:", decodedEventLog);
    //         const purchasedTimestamp =
    //           decodedEventLog.data.purchasedTimestamp.toNumber();
    //         const publicSaleStartTime = 1704963600;
    //         const publicSaleEndTime = 1705568400;
    //         if (
    //           purchasedTimestamp < publicSaleStartTime ||
    //           purchasedTimestamp > publicSaleEndTime
    //         ) {
    //           continue;
    //         }
    //         const user = decodedEventLog.data.user;
    //         // if (!userPurchasedExisted.has(user.toBase58())) {
    //         //   uniqueUserPurchasedCnt += 1;
    //         //   userPurchasedExisted.set(user.toBase58(), true);
    //         // }
    //         // console.log(decodedEventLog);
    //         const individualCommissionAmount = new BigNumber(
    //           decodedEventLog.data.individualCommissionAmount.toString()
    //         )
    //           .div(new BigNumber(10).pow(9))
    //           .toNumber();

    //         let totalCommissionAmountInTx = 0;
    //         if (decodedEventLog.data.referrer == null) {
    //           totalCommissionAmountInTx = individualCommissionAmount;
    //         } else {
    //           totalCommissionAmountInTx = individualCommissionAmount * 2;
    //         }

    //         totalCommissionAmount += totalCommissionAmountInTx;

    //         const tokenPrice = new BigNumber(
    //           decodedEventLog.data.tokenPrice.toString()
    //         )
    //           .div(new BigNumber(10).pow(9))
    //           .toNumber();

    //         const purchasedAmount = new BigNumber(
    //           decodedEventLog.data.purchasedAmount.toString()
    //         )
    //           .div(new BigNumber(10).pow(9))
    //           .toNumber();

    //         const propertyAmount = new BigNumber(
    //           decodedEventLog.data.propertyAmount.toString()
    //         )
    //           .div(new BigNumber(10).pow(9))
    //           .toNumber();

    //         // writableStream.write(
    //         //   [
    //         //     user,
    //         //     decodedEventLog.data.propertyState,
    //         //     decodedEventLog.data.propertyMintAccount,
    //         //     tokenPrice,
    //         //     decodedEventLog.data.saleType,
    //         //     purchasedAmount,
    //         //     propertyAmount,
    //         //     decodedEventLog.data.purchasedTimestamp,
    //         //     decodedEventLog.data.referrer,
    //         //     individualCommissionAmount,
    //         //     txSigInfo.signature,
    //         //   ].toString() + "\n"
    //         // );
    //         // breakCnt += 1;
    //         // if (breakCnt >= 2) {
    //         //   console.log({ commissionAmount });
    //         //   return;
    //         // }
    //         txTypeCnt.purchase += 1;
    //       } else if (
    //         checkTxType(tx.meta.logMessages) == "ClaimPropertyToken" &&
    //         eventLog != ""
    //       ) {
    //         txTypeCnt.claim += 1;
    //       } else {
    //         txTypeCnt.util += 1;
    //         // console.log(tx.meta.logMessages);
    //       }
    //     }
    //   }
    // }
    lastSignature = txSigInfos[txSigInfos.length - 1].signature;

    if (txSigInfos.length < 1000) {
      console.log({ lastSignature });
      break; // No more signatures
    }
  }

  console.log({ txSigInfosCnt });
  console.log({ txTypeCnt });
  console.log({ uniqueUserPurchasedCnt });
  console.log({ totalCommissionAmount });
};

const checkTxType = (programLogs: string[]): string => {
  for (const txType of txTypes) {
    const hasElementWithText = programLogs.some((element) =>
      element.includes(txType)
    );
    if (hasElementWithText) return txType;
  }
  return "";
};

const getEventLog = (programLogs: string[], programId: PublicKey): string => {
  const startProgramLog = programLogs.find((element) =>
    element.includes(`Program ${programId}`)
  );
  const startIdx = startProgramLog ? programLogs.indexOf(startProgramLog) : 0;
  const endProgramLog = programLogs
    .reverse()
    .find((element) => element.includes(`Program ${programId}`));
  const endIdx =
    programLogs.length -
    (endProgramLog ? programLogs.indexOf(endProgramLog) : 0);

  const event = programLogs
    .reverse()
    .slice(startIdx, endIdx)
    .filter((element) => {
      return /^Program log:/.test(element);
    })
    .pop()
    ?.split("Program log: ")[1];
  return event || "";
};
