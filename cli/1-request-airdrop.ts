import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export const requestAirdrop = async (
  receiver: PublicKey,
  uiAmount: number,
  rpcEndpoint: string
) => {
  const connection = new Connection(rpcEndpoint, "confirmed");

  console.log("PreBalance ", await connection.getBalance(receiver));

  const airdropSignature = await connection.requestAirdrop(
    receiver,
    LAMPORTS_PER_SOL * uiAmount
  );

  const latestBlockHash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: airdropSignature,
  });

  console.log("PostBalance", await connection.getBalance(receiver));
};
