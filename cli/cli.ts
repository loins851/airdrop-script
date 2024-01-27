import { Command } from "commander";
const figlet = require("figlet");
const fs = require("fs");
import { Keypair, PublicKey } from "@solana/web3.js";
import { convertKeyPairFromArrayType } from "./0-1-convert-keypair-from-array-type";
import { requestAirdrop } from "./1-request-airdrop";
import { createRandomToken } from "./2-1-create-random-token";
import { createSpecificToken } from "./2-2-create-specific-token";
import { mintToken } from "./3-mint-token";
import { transferTokenToATA } from "./4-1-transfer-token-to-ATA";
import { transferTokenToNonATA } from "./4-2-transfer-token-to-non-ATA";
import { distributeTokenInBatch } from "./7-distribute-token-in-batch";
import { convertKeyPairFromBs58Type } from "./0-2-convert-keypair-from-bs58-type";

const __path = process.cwd();
const program = new Command();

const MAINNET_RPC = "https://api-mainnet-beta.renec.foundation:8899/";
const TESTNET_RPC = "https://api-testnet.renec.foundation:8899/";
const LOCAL_RPC = "http://localhost:8899/";

console.log(figlet.textSync("Script to interact Blockchain"));
console.log("");

const payerSecretKey = JSON.parse(
  fs.readFileSync(__path + "/.wallets/payer.json").toString()
);

const payer = Keypair.fromSecretKey(Uint8Array.from(payerSecretKey));

const getRpc = (network: string): string => {
  if (
    !network ||
    (network !== "mainnet" && network !== "testnet" && network !== "localnet")
  ) {
    console.log(
      "Error: -n, --network is required. [mainnet, testnet, localnet]"
    );
    process.exit(1);
  }

  let rpc = MAINNET_RPC;
  if (network === "testnet") {
    rpc = TESTNET_RPC;
  }
  if (network === "localnet") {
    rpc = LOCAL_RPC;
  }
  return rpc;
};

// yarn build:cli && yarn cli 0-1-convert-keypair-from-array-type
program
  .command("0-1-convert-keypair-from-array-type")
  .description("0-1-convert-keypair-from-array-type")
  .action(async () => {
    convertKeyPairFromArrayType(payer);
  });

// yarn build:cli && yarn cli 0-2-convert-keypair-from-bs58-type -kp {}
program
  .command("0-2-convert-keypair-from-bs58-type")
  .description("0-2-convert-keypair-from-bs58-type")
  .option("-kp, --keypair <string>", "Keypair in base58 type")
  .action(async (params) => {
    let { keypair } = params;
    convertKeyPairFromBs58Type(keypair);
  });

// yarn build:cli && yarn cli 1-request-airdrop -n testnet -r {} -a 10
program
  .command("1-request-airdrop")
  .description("1-request-airdrop")
  .option("-n, --network <string>", "Network: testnet, localnet", "testnet")
  .option("-r, --receiver <string>", "Receiver address")
  .option("-a, --uiAmount <number>", "UI Amount", "10")
  .action(async (params) => {
    let { network, receiver, uiAmount } = params;

    const rpc = getRpc(network);
    await requestAirdrop(new PublicKey(receiver), uiAmount, rpc);
  });

// yarn build:cli && yarn cli 2-1-create-random-token -n testnet -d 9
program
  .command("2-1-create-random-token")
  .description("2-1-create-random-token")
  .option(
    "-n, --network <string>",
    "Network: mainnet, testnet, localnet",
    "testnet"
  )
  .option("-d, --decimals <number>", "Token decimals", "9")
  .action(async (params) => {
    let { network, decimals } = params;

    const rpc = getRpc(network);
    await createRandomToken(payer, rpc, decimals);
  });

// yarn build:cli && yarn cli 2-2-create-specific-token -n testnet -d 9 --tokenKeypairPath /.wallets/token.json
program
  .command("2-2-create-specific-token")
  .description("2-2-create-specific-token")
  .option(
    "-n, --network <string>",
    "Network: mainnet, testnet, localnet",
    "testnet"
  )
  .option("-d, --decimals <number>", "Token decimals", "9")
  .option(
    "--tokenKeypairPath <string>",
    "Token keypair path",
    "/.wallets/token.json"
  )
  .action(async (params) => {
    let { network, decimals, tokenKeypairPath } = params;
    const tokenSecretKey = JSON.parse(
      fs.readFileSync(__path + tokenKeypairPath)
    );
    const tokenKeypair = Keypair.fromSecretKey(Uint8Array.from(tokenSecretKey));

    const rpc = getRpc(network);
    await createSpecificToken(payer, rpc, tokenKeypair, decimals);
  });

// yarn build:cli && yarn cli 3-mint-token -n testnet -t {} -r {} -a 10
program
  .command("3-mint-token")
  .description("3-mint-token")
  .option(
    "-n, --network <string>",
    "Network: mainnet, testnet, localnet",
    "testnet"
  )
  .option("-t, --token <string>", "Token address")
  .option("-r, --receiver <string>", "Receiver address")
  .option("-a, --uiAmount <number>", "UI Amount", "10")
  .action(async (params) => {
    let { network, token, receiver, uiAmount } = params;

    const rpc = getRpc(network);
    await mintToken(
      payer,
      rpc,
      new PublicKey(token),
      new PublicKey(receiver),
      Number(uiAmount)
    );
  });

// yarn build:cli && yarn cli 4-1-transfer-token-to-ATA -n testnet -t {} -r {} -a 10
program
  .command("4-1-transfer-token-to-ATA")
  .description("4-1-transfer-token-to-ATA")
  .option(
    "-n, --network <string>",
    "Network: mainnet, testnet, localnet",
    "testnet"
  )
  .option("-t, --token <string>", "Token address")
  .option("-r, --receiver <string>", "Receiver address")
  .option("-a, --uiAmount <number>", "UI Amount", "10")
  .action(async (params) => {
    let { network, token, receiver, uiAmount } = params;

    const rpc = getRpc(network);
    await transferTokenToATA(
      payer,
      rpc,
      new PublicKey(token),
      new PublicKey(receiver),
      Number(uiAmount)
    );
  });

// yarn build:cli && yarn cli 4-2-transfer-token-to-non-ATA -n testnet -t {} -r {} -a 10
program
  .command("4-2-transfer-token-to-non-ATA")
  .description("4-2-transfer-token-to-non-ATA")
  .option(
    "-n, --network <string>",
    "Network: mainnet, testnet, localnet",
    "testnet"
  )
  .option("-t, --token <string>", "Token address")
  .option("-r, --receiver <string>", "Receiver address")
  .option("-a, --uiAmount <number>", "UI Amount", "10")
  .action(async (params) => {
    let { network, token, receiver, uiAmount } = params;

    const rpc = getRpc(network);
    await transferTokenToNonATA(
      payer,
      rpc,
      new PublicKey(token),
      new PublicKey(receiver),
      Number(uiAmount)
    );
  });

// yarn build:cli && yarn cli 7-distribute-token-in-batch -n testnet -t {} --inputFileRelativePath {""} --resultFileRelativePath {""}
program
  .command("7-distribute-token-in-batch")
  .description("7-distribute-token-in-batch")
  .option(
    "-n, --network <string>",
    "Network: mainnet, testnet, localnet",
    "testnet"
  )
  .option("-t, --token <string>", "Token address")
  .option(
    "--inputFileRelativePath <string>",
    "Input file relative path",
    "/data/input.csv"
  )
  .option(
    "--resultFileRelativePath <string>",
    "Result file relative path",
    "/data/result.csv"
  )
  .action(async (params) => {
    let { network, token, inputFileRelativePath, resultFileRelativePath } =
      params;
    const inputFilePath = __path + inputFileRelativePath;
    const resultFilePath = __path + resultFileRelativePath;

    const rpc = getRpc(network);
    await distributeTokenInBatch(
      payer,
      rpc,
      new PublicKey(token),
      inputFilePath,
      resultFilePath
    );
  });

program.parse();
