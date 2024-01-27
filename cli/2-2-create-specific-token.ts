import {
  Connection,
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import { Token, TOKEN_PROGRAM_ID, MintLayout } from "@solana/spl-token";

export const createSpecificToken = async (
  payer: Keypair,
  rpcEndpoint: string,
  mintKeypair: Keypair,
  tokenDecimals: number
) => {
  const connection = new Connection(rpcEndpoint, "confirmed");

  const tx = new Transaction();

  const lamports = await connection.getMinimumBalanceForRentExemption(
    MintLayout.span
  );

  tx.add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      lamports,
      newAccountPubkey: mintKeypair.publicKey,
      programId: TOKEN_PROGRAM_ID,
      space: MintLayout.span,
    })
  );

  tx.add(
    Token.createInitMintInstruction(
      TOKEN_PROGRAM_ID,
      mintKeypair.publicKey,
      tokenDecimals,
      payer.publicKey,
      null
    )
  );

  const txSig = await sendAndConfirmTransaction(connection, tx, [
    payer,
    mintKeypair,
  ]);
  console.log(mintKeypair.publicKey);
};
