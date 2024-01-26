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
  AccountLayout,
  MintLayout,
} from "@solana/spl-token";

require("dotenv").config();

const main = async () => {
  const rpcEndpoint =
    process.env.RPC_ENDPOINT || "https://api-testnet.renec.foundation:8899"; // https://api-mainnet-beta.renec.foundation:8899
  const connection = new Connection(rpcEndpoint, "confirmed");

  const propeasyProgramId = new PublicKey("");

  const accounts = await connection.getParsedProgramAccounts(
    propeasyProgramId, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    {
      filters: [
        {
          dataSize: 184, // number of bytes
        },
      ],
    }
  );
  console.log(accounts);
  console.log("Length: ", accounts.length);
};

try {
  main();
} catch (error) {
  console.log(error);
}
