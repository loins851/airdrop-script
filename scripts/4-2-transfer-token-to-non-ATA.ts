import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
  AccountLayout,
} from "@solana/spl-token";
import * as bs58 from "bs58";
require("dotenv").config();

const main = async () => {
  const payer = Keypair.fromSecretKey(
    bs58.decode(process.env.PRIVATE_KEY_BASE58 || "")
  );

  const rpcEndpoint =
    process.env.RPC_ENDPOINT || "https://api-testnet.renec.foundation:8899"; // https://api-mainnet-beta.renec.foundation:8899
  const connection = new Connection(rpcEndpoint, "confirmed");

  const mintTokenAccount = new PublicKey(process.env.MINT_TOKEN_ACCOUNT || "");

  const receiverPublickey = new PublicKey("");

  const payerAssociatedTokenAccount = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mintTokenAccount,
    payer.publicKey,
    true
  );

  // transfer to non ATA
  const receiverTokenAccount = Keypair.generate();
  const tx = new Transaction();

  const lamportsForTokenAccount =
    await connection.getMinimumBalanceForRentExemption(AccountLayout.span);

  tx.add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      lamports: lamportsForTokenAccount,
      newAccountPubkey: receiverTokenAccount.publicKey,
      programId: TOKEN_PROGRAM_ID,
      space: AccountLayout.span,
    }),

    Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      mintTokenAccount,
      receiverTokenAccount.publicKey,
      receiverPublickey
    ),

    Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      payerAssociatedTokenAccount,
      receiverTokenAccount.publicKey,
      payer.publicKey,
      [],
      200000000
    )
  );

  const txSig = await connection.sendTransaction(tx, [
    payer,
    receiverTokenAccount,
  ]);

  console.log("=============================");
  console.log(receiverTokenAccount.secretKey);
  console.log(receiverTokenAccount.publicKey);
  console.log(txSig);
};

try {
  main();
} catch (error) {
  console.log(error);
}
