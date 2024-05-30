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

interface Social {
  id: string;
  chainId: string;
  blockchain: string;
  dappName: string;
  dappSlug: string;
  dappVersion: string;
  userId: string;
  userAddress: string;
  userCreatedAtBlockTimestamp: string;
  userCreatedAtBlockNumber: number;
  userLastUpdatedAtBlockTimestamp: string;
  userLastUpdatedAtBlockNumber: number;
  userHomeURL: string;
  userRecoveryAddress: string;
  userAssociatedAddresses: string[];
  profileBio: string;
  profileDisplayName: string;
  profileImage: string;
  profileUrl: string;
  profileName: string;
  profileTokenId: string;
  profileTokenAddress: string;
  profileCreatedAtBlockTimestamp: string;
  profileCreatedAtBlockNumber: number;
  profileLastUpdatedAtBlockTimestamp: string;
  profileLastUpdatedAtBlockNumber: number;
  profileTokenUri: string;
  isDefault: boolean;
  identity: string;
  fnames: string[];
  isFarcasterPowerUser: boolean;
}

interface TrendingToken {
  address: string;
  criteriaCount: number;
  timeFrom: string;
  timeTo: string;
  token: {
    name: string;
    symbol: string;
    type: string;
  };
}

interface UserDetailResponse {
  Socials: {
    Social: Social[];
  };
}

//Disabled for the moment.
interface TrendingTokenResponse {
  TrendingTokens: {
    TrendingToken: TrendingToken[];
  };
}

const userDetailFetchFunction = async (): Promise<UserDetailResponse> => {
  const userDetailQuery = `
    query MyQuery {
        Socials(
          input: {
            filter: { dappName: { _eq: farcaster }, identity: { _eq: "fc_fid:406278" } }
            blockchain: ethereum
          }
        ) {
          Social {
            id
            chainId
            blockchain
            dappName
            dappSlug
            dappVersion
            userId
            userAddress
            userCreatedAtBlockTimestamp
            userCreatedAtBlockNumber
            userLastUpdatedAtBlockTimestamp
            userLastUpdatedAtBlockNumber
            userHomeURL
            userRecoveryAddress
            userAssociatedAddresses
            profileBio
            profileDisplayName
            profileImage
            profileUrl
            profileName
            profileTokenId
            profileTokenAddress
            profileCreatedAtBlockTimestamp
            profileCreatedAtBlockNumber
            profileLastUpdatedAtBlockTimestamp
            profileLastUpdatedAtBlockNumber
            profileTokenUri
            isDefault
            identity
            fnames
            isFarcasterPowerUser
          }
        }
      }
  `;

  const { data, error }: QueryResponse<UserDetailResponse> = await fetchQuery(userDetailQuery);

  if (error) {
    console.error("User Detail Error:", error);
    throw new Error(error.message);
  }

  return data;
}

/*
 * Trending Token API calls consume too much credit!!! 
 * Disabled for the moment 
**/

// const trendingTokenFetchFunction = async (): Promise<TrendingTokenResponse> => {

//   const variables = {
//     transferType: "self_initiated",
//     timeFrame: "seven_days",
//     criteria: "unique_wallets",
//     swappable: true,
//   };

//   const trendingTokenQuery = `query TokenQuery(
//     $transferType: TrendingTokensTransferType!,
//     $timeFrame: TimeFrame!,
//     $criteria: TrendingTokensCriteria!,
//     $swappable: Boolean!
//   ) {
//     TrendingTokens(
//       input: {
//         transferType: $transferType,
//         timeFrame: $timeFrame,
//         audience: all,
//         blockchain: degen,
//         criteria: $criteria,
//         swappable: { _eq: $swappable }
//       }
//     ) {
//       TrendingToken {
//         address
//         criteriaCount
//         timeFrom
//         timeTo
//         token {
//           name
//           symbol
//           type
//         }
//       }
//     }
//   }`;

// Log query and variables for debugging
//console.log("GraphQL Query:", trendingTokenQuery);
//console.log("Variables:", variables);

// const { data, error }: QueryResponse<TrendingTokenResponse> = await fetchQuery(trendingTokenQuery, variables);

// // Log full error object for debugging
// if (error) {
//   console.error("GraphQL Error:", error);
//   throw new Error(error.message);
// }

// return data;
// }

const main = async () => {
  /*
  * Trending Token API calls consume too much credit!!! 
  * Disabled for the moment 
  **/

  // try {
  //   const trendingTokens = await trendingTokenFetchFunction();

  //   console.log(trendingTokens.TrendingTokens);
  // } catch (error) {
  //   console.error("Error fetching trending tokens:", error);
  // }

  try {
    const userDetail = await userDetailFetchFunction();
    console.log(userDetail.Socials.Social);
  } catch (error) {
    console.error("Error fetching user detail:", error);
  }
};

main();
