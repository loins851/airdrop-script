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
  MintLayout
} from "@solana/spl-token";

require("dotenv").config();

const main = async () => {

  const rpcEndpoint =
    process.env.RPC_ENDPOINT || "https://api-testnet.renec.foundation:8899"; // https://api-mainnet-beta.renec.foundation:8899
  const connection = new Connection(rpcEndpoint, "confirmed");

  // reUSD or PROP
  const mintTokenAccount = new PublicKey(process.env.MINT_TOKEN_ACCOUNT || "");

  const accounts = await connection.getParsedProgramAccounts(
    TOKEN_PROGRAM_ID, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    {
      filters: [
        {
          dataSize: 165, // number of bytes
        },
        {
          memcmp: {
            offset: 0, // number of bytes
            bytes: mintTokenAccount.toBase58(), // base58 encoded string
          },
        },
      ],
    }
  );
  console.log(accounts[0].account.data)
  console.log("Length: ", accounts.length);

  const accounts2 = await connection.getProgramAccounts(
    TOKEN_PROGRAM_ID, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    {
      dataSlice: {
        offset: 0, // number of bytes
        length: 0, // number of bytes
      },
      filters: [
        {
          dataSize: 165, // number of bytes
        },
        {
          memcmp: {
            offset: 0, // number of bytes
            bytes: mintTokenAccount.toBase58(), // base58 encoded string
          },
        },
      ],
    }
  );
  console.log(accounts2[0].account.data);
  console.log(JSON.stringify(accounts2[0].account.data));
  console.log("Length: ", accounts2.length);
};

try {
  main();
} catch (error) {
  console.log(error);
}

// curl https://api-mainnet-beta.renec.foundation:8899 -X POST -H "Content-Type: application/json" -d '
//   {
//     "jsonrpc": "2.0",
//     "id": 1,
//     "method": "getProgramAccounts",
//     "params": [
//       "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
//       {
//         "encoding": "jsonParsed",
//         "filters": [
//           {
//             "dataSize": 165
//           },
//           {
//             "memcmp": {
//               "offset": 0,
//               "bytes": ""
//             }
//           }
//         ]
//       }
//     ]
//   }'
