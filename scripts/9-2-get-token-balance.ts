import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
  u64,
} from "@solana/spl-token";

require("dotenv").config();

const main = async () => {
  const rpcEndpoint =
    process.env.RPC_ENDPOINT || "https://api-testnet.renec.foundation:8899"; // https://api-mainnet-beta.renec.foundation:8899
  const connection = new Connection(rpcEndpoint, "confirmed");

  // reUSD or PROP
  const mintTokenAccount = new PublicKey(
    process.env.MINT_TOKEN_ACCOUNT ||
    ""
  );

  const owner = new PublicKey("");

  const ata = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mintTokenAccount,
    owner,
    false
  );

  let balanceInfo: {
    amount: string,
    uiAmount: number,
    uiAmountString: string
  }
  try {
    const ataBalanceInfo = await connection.getTokenAccountBalance(ata)

    balanceInfo = {
      amount: ataBalanceInfo.value.amount,
      uiAmount: ataBalanceInfo.value.uiAmount || 0,
      uiAmountString: ataBalanceInfo.value.uiAmountString || '0'
    }
  } catch (error) {
    balanceInfo = {
      amount: '0',
      uiAmount: 0,
      uiAmountString: '0'
    }
  }
  console.log({balanceInfo})

  console.log(await connection.getTokenAccountsByOwner(owner, {
    mint: mintTokenAccount,
    programId: TOKEN_PROGRAM_ID
  }))

  console.log(await connection.getTokenAccountBalance(new PublicKey('')))

  console.log(await connection.getBalance(owner))
};

try {
  main();
} catch (error) {
  console.log(error);
}
