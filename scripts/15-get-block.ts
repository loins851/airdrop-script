import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

require("dotenv").config();
const rpcEndpoint =
  process.env.RPC_ENDPOINT || "https://api-testnet.renec.foundation:8899"; // https://api-mainnet-beta.renec.foundation:8899

const main = async () => {
  const connection = new Connection(rpcEndpoint, "confirmed");
  const blockHeight = await connection.getBlockHeight("finalized");
  console.log(blockHeight);
  const block = await connection.getBlock(blockHeight, {
    transactionDetails: "full",
  });
  console.log(block);
  const blockProdInfo = await connection.getBlockProduction({
    commitment: "finalized",
  });
  console.log(blockProdInfo.context.slot);
  const block2 = await connection.getBlock(blockProdInfo.context.slot, {
    transactionDetails: "full",
  });
  console.log(block2);
  //   const txLength = block?.transactions.length || 0;
  //   for (let i = 0; i < txLength; i++) {
  //     console.log(block?.transactions[i]);
  //     console.log("=====================");
  //     console.log(block?.transactions[i].transaction.message.accountKeys);
  //     console.log("=====================");
  //     console.log(block?.transactions[i].meta?.logMessages);
  //   }

  //   const blockProd = await connection.getBlockProduction({
  //     commitment: "finalized",
  //   });
  //   console.log(blockProd);

  //   const blockSignatures = await connection.getBlockSignatures(104707640)
  //   console.log(blockSignatures)

  //   const blocks = await connection.getBlocks(104707630, 104707650);
  //   console.log(blocks);

  //   const parsedBlock = await connection.getParsedBlock(104707640);
  //   console.log(parsedBlock);
};

try {
  main();
} catch (error) {
  console.log(error);
}
