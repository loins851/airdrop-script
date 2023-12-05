import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
require("dotenv").config();

const main = async () => {
  const publicKey = new PublicKey(
    ""
  );

  const rpcEndpoint =
    process.env.RPC_ENDPOINT || "https://api-testnet.renec.foundation:8899"; // https://api-mainnet-beta.renec.foundation:8899
  const connection = new Connection(rpcEndpoint, "confirmed");

  console.log(await connection.getBalance(publicKey));

  const airdropSignature = await connection.requestAirdrop(
    publicKey,
    LAMPORTS_PER_SOL
  );

  const latestBlockHash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: airdropSignature,
  });

  console.log(await connection.getBalance(publicKey));
};

try {
  main();
} catch (error) {
  console.log(error);
}
