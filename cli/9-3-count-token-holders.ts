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

export const countTokenHolders = async (
  rpcEndpoint: string,
  mintTokenAccount: PublicKey
) => {
  const connection = new Connection(rpcEndpoint, "confirmed");

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
  console.log("Total account:", accounts.length);
  let activeAccounts = 0;
  accounts.forEach((element) => {
    if ((element.account.data as any).parsed.info.tokenAmount.uiAmount > 0) {
      activeAccounts += 1;
    }
  });

  console.log("Active account:", activeAccounts);
  // const accounts2 = await connection.getProgramAccounts(
  //   TOKEN_PROGRAM_ID, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
  //   {
  //     dataSlice: {
  //       offset: 0, // number of bytes
  //       length: 0, // number of bytes
  //     },
  //     filters: [
  //       {
  //         dataSize: 165, // number of bytes
  //       },
  //       {
  //         memcmp: {
  //           offset: 0, // number of bytes
  //           bytes: mintTokenAccount.toBase58(), // base58 encoded string
  //         },
  //       },
  //     ],
  //   }
  // );
  // console.log("Total account:", accounts2.length);
};

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
