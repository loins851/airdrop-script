import {
  Connection,
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction
} from "@solana/web3.js";

import { Token, TOKEN_PROGRAM_ID, MintLayout } from "@solana/spl-token";
import * as bs58 from "bs58";
require("dotenv").config();

const main = async () => {
  const payer = Keypair.fromSecretKey(
    bs58.decode(process.env.PRIVATE_KEY_BASE58 || "")
  );

  const rpcEndpoint =
    process.env.RPC_ENDPOINT || "https://api-testnet.renec.foundation:8899"; // https://api-mainnet-beta.renec.foundation:8899
  const connection = new Connection(rpcEndpoint, "confirmed");

  const mintKeypair = Keypair.fromSecretKey(new Uint8Array([]));
  const tx = new Transaction();

  const lamports = await connection.getMinimumBalanceForRentExemption(
    MintLayout.span
  );

  const decimals = 9;

  tx.add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      lamports,
      newAccountPubkey: mintKeypair.publicKey,
      programId: TOKEN_PROGRAM_ID,
      space: MintLayout.span
    })
  );

  tx.add(
    Token.createInitMintInstruction(TOKEN_PROGRAM_ID, mintKeypair.publicKey, decimals, payer.publicKey, null)
  )

  const txSig = await sendAndConfirmTransaction(connection, tx, [payer, mintKeypair])
  console.log(mintKeypair.publicKey)
};

try {
  main();
} catch (error) {
  console.log(error);
}
