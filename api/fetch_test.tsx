import { init, fetchQuery } from "@airstack/node";
import * as dotenv from 'dotenv';
dotenv.config();
init(`${process.env.AIRSTACK_API_KEY}`);

interface QueryResponse<T> {
  data: T;
  error: CustomError | null;
}

interface CustomError {
  message: string;
}

interface TokenBalanceQueryResponseData {
  TokenBalances: TokenBalances;
}

interface TokenBalances {
  TokenBalance: TokenBalance[];
  pageInfo: PageInfo;
}

interface TokenBalance {
  owner: Owner;
  amount: string;
  tokenAddress: string;
  token: Token;
}

interface Owner {
  socials: Social[];
}

interface Social {
  profileName: string;
  userId: string;
  userAssociatedAddresses: string[];
}

interface Token {
  name: string;
  symbol: string;
}

interface PageInfo {
  nextCursor: string;
  prevCursor: string;
}

const baseTokenFetchFunction = async (): Promise<TokenBalanceQueryResponseData> => {
  const baseTokensQuery = `query ERC20sOwnedByFarcasterUser {
    TokenBalances(
      input: {
        filter: {
          owner: { _in: ["fc_fid:406278"] }
          tokenType: { _eq: ERC20 }
        }
        blockchain: base
        limit: 50
      }
    ) {
      TokenBalance {
        owner {
          socials(input: { filter: { dappName: { _eq: farcaster } } }) {
            profileName
            userId
            userAssociatedAddresses
          }
        }
        amount
        tokenAddress
        token {
          name
          symbol
        }
      }
      pageInfo {
        nextCursor
        prevCursor
      }
    }
  }`;
  const { data, error }: QueryResponse<TokenBalanceQueryResponseData> = await fetchQuery(baseTokensQuery);

  if (error) {
    console.error("Error:", error);
    throw new Error(error.message);
  }

  return data;
}



const main = async () => {

  try {
    const response = await baseTokenFetchFunction();
    console.log(response.TokenBalances.TokenBalance);
  } catch (error) {
    console.error("Error fetching :", error);
  }
};

main();
