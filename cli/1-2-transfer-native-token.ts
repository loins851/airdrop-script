import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

export const transferNativeToken = async (
  payer: Keypair,
  rpcEndpoint: string,
  receiver: PublicKey,
  uiAmount: number
) => {
  const connection = new Connection(rpcEndpoint, "confirmed");
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: receiver,
      lamports: uiAmount * LAMPORTS_PER_SOL,
    })
  );
  const latestBlockHash = await connection.getLatestBlockhash("finalized");
  tx.recentBlockhash = latestBlockHash.blockhash;
  tx.sign(payer);

  const txSig = await connection.sendRawTransaction(tx.serialize());
  console.log({ txSig });
};
