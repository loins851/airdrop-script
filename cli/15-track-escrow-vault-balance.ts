import { Connection, PublicKey } from "@solana/web3.js";
import fs from "fs";

export const trackEscrowVaultBalance = async (
  vault: PublicKey,
  rpcEndpoint: string,
  resultFilePath: string
) => {
  const connection = new Connection(rpcEndpoint, "confirmed");
  let lastSignature: string | undefined;

  const tokenAccountInfo = await connection.getParsedAccountInfo(vault);
  const owner = (tokenAccountInfo.value?.data as any).parsed.info.owner;

  let txSigInfosCnt = 0;

  let isResultFileExisted = fs.existsSync(resultFilePath) ? true : false;
  const writableStream = fs.createWriteStream(resultFilePath, { flags: "a+" });

  if (!isResultFileExisted) {
    writableStream.write(
      [
        "preTokenBalance",
        "postTokenBalance",
        "timestamp",
        "tx_sig",
      ].toString() + "\n"
    );
  }

  while (true) {
    // get maximum 1000 tx signature related to vault
    const txSigInfos = await connection.getSignaturesForAddress(vault, {
      before: lastSignature,
    });

    txSigInfosCnt += txSigInfos.length;
    console.log({ txSigInfosCntTmp: txSigInfosCnt });

    for (const [idx, txSigInfo] of txSigInfos.entries()) {
      const tx = await connection.getParsedTransaction(
        txSigInfo.signature,
        "finalized"
      );

      console.log("processing with", idx, "of", txSigInfos.length);

      // pre balance
      const preTokenBalances = tx?.meta?.preTokenBalances;
      const vaultPreInfo = preTokenBalances?.filter((item) => {
        return item.owner == owner;
      })[0];
      const vaultPreBalance = vaultPreInfo?.uiTokenAmount.uiAmount;

      // post balance
      const postTokenBalances = tx?.meta?.postTokenBalances;
      const vaultPostInfo = postTokenBalances?.filter((item) => {
        return item.owner == owner;
      })[0];
      const vaultPostBalance = vaultPostInfo?.uiTokenAmount.uiAmount;
      const timestamp = new Date(Number(tx?.blockTime) * 1000);

      // write to file
      writableStream.write(
        [
          vaultPreBalance,
          vaultPostBalance,
          timestamp,
          txSigInfo.signature,
        ].toString() + "\n"
      );
    }

    lastSignature = txSigInfos[txSigInfos.length - 1].signature;
    if (txSigInfos.length < 1000) {
      console.log({ lastSignature });
      break; // No more signatures
    }
  }
};
