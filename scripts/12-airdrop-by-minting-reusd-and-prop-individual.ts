import process from "process";

import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
  u64,
} from "@solana/spl-token";

import BN from "bn.js";
import * as bs58 from "bs58";
require("dotenv").config();

const main = async (receiverAddress: string) => {
  const rpcEndpoint =
    process.env.RPC_ENDPOINT || "https://api-testnet.renec.foundation:8899"; // https://api-mainnet-beta.renec.foundation:8899
  const connection = new Connection(rpcEndpoint, "confirmed");

  // pay for tx
  const payer = Keypair.fromSecretKey(
    bs58.decode(process.env.PRIVATE_KEY_BASE58 || "")
  );

  // reusd
  const reusdMintTokenAccount = new PublicKey(process.env.REUSD_TOKEN || "");
  const reusdMintTokenInfo = await connection.getParsedAccountInfo(
    reusdMintTokenAccount
  );
  if (reusdMintTokenInfo.value == null) return;
  const reusdDecimals = (reusdMintTokenInfo.value.data as any).parsed.info
    .decimals;
  const reusdMaximumUiAmount =
    Number(process.env.REUSD_MAXIMUM_UI_AMOUNT) || 10000;
  const reusdAirdropAmount = Number(process.env.REUSD_AIRDROP_AMOUNT) || 1000;

  // prop
  const propMintTokenAccount = new PublicKey(process.env.PROP_TOKEN || "");
  const propMintTokenInfo =
    await connection.getParsedAccountInfo(propMintTokenAccount);
  if (propMintTokenInfo.value == null) return;
  const propDecimals = (propMintTokenInfo.value.data as any).parsed.info
    .decimals;
  const propAirdropAmount = Number(process.env.PROP_AIRDROP_AMOUNT) || 10;

  const receiver = new PublicKey(receiverAddress);
  const tx = new Transaction();

  // airdrop reusd
  const receiverReusdATA = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    reusdMintTokenAccount,
    receiver,
    true
  );

  let receiverReusdATAInfo = await connection.getAccountInfo(
    receiverReusdATA,
    "confirmed"
  );

  if (receiverReusdATAInfo == null) {
    tx.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        reusdMintTokenAccount,
        receiverReusdATA,
        receiver,
        payer.publicKey
      )
    );
  } else {
    let receiverReusdBalance = (
      await connection.getTokenAccountBalance(receiverReusdATA)
    ).value.uiAmount;

    if (
      receiverReusdBalance != null &&
      receiverReusdBalance >= reusdMaximumUiAmount
    ) {
      throw new Error("Exceed maximum reusd airdrop amount");
    }
  }

  const uiReusdAmount = new u64(reusdAirdropAmount);
  const reusdAmount = uiReusdAmount.mul(new BN(10).pow(new BN(reusdDecimals)));
  tx.add(
    Token.createMintToInstruction(
      TOKEN_PROGRAM_ID,
      reusdMintTokenAccount,
      receiverReusdATA,
      payer.publicKey,
      [],
      new u64(reusdAmount.toString())
    )
  );

  // airdrop prop
  const receiverPropATA = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    propMintTokenAccount,
    receiver,
    true
  );

  let receiverPropATAInfo = await connection.getAccountInfo(
    receiverPropATA,
    "confirmed"
  );
  let receiverPropBalance: number | null = null;
  if (receiverPropATAInfo == null) {
    tx.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        propMintTokenAccount,
        receiverPropATA,
        receiver,
        payer.publicKey
      )
    );
  } else {
    receiverPropBalance = (
      await connection.getTokenAccountBalance(receiverPropATA)
    ).value.uiAmount;
  }

  if (receiverPropATAInfo == null || receiverPropBalance == 0) {
    const uiPropAmount = new u64(propAirdropAmount);
    const propAmount = uiPropAmount.mul(new BN(10).pow(new BN(propDecimals)));
    tx.add(
      Token.createMintToInstruction(
        TOKEN_PROGRAM_ID,
        propMintTokenAccount,
        receiverPropATA,
        payer.publicKey,
        [],
        new u64(propAmount.toString())
      )
    );
  }

  const txSig = await connection.sendTransaction(tx, [payer]);

  console.log({ txSig });
};

try {
  main("");
} catch (error) {
  console.log(error);
}
