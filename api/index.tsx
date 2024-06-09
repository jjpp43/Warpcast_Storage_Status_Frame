import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from '@hono/node-server/serve-static'
//import { userData, main } from './userStorage.js'
// import {
//   getFarcasterUserDetails,
//   validateFramesMessage,
// } from "@airstack/frog";
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/vercel'
import { createSystem } from 'frog/ui'

import axios from "axios";
import { config } from "dotenv";

config();

// Define interfaces
interface Limit {
  storeType: string;
  name: string;
  limit: number;
  used: number;
  earliestTimestamp: number;
  earliestHash: string;
}

interface LimitsResponse {
  limits: Limit[];
}

//Export user storage data
const userData = {
  userCastStorage: "",
  userLinkStorage: "",
  userReactionStorage: "",
  userDataStorage: 0,
}

// Main function to fetch and handle data
const main = async (id: number) => {
  const server = "https://hubs.airstack.xyz";

  try {
    const response = await axios.get<LimitsResponse>(`${server}/v1/storageLimitsByFid?fid=${id}`, {
      headers: {
        "Content-Type": "application/json",
        "x-airstack-hubs": process.env.AIRSTACK_API_KEY,
      },
    });

    // Check if response.data is defined
    if (!response.data) {
      console.error("Response data is undefined.");
      return;
    }

    const tmp = response.data.limits;

    tmp.forEach((i) => {
      if (i["storeType"] === 'STORE_TYPE_CASTS') {
        var t = i['used'] / i['limit'];
        userData.userCastStorage = (parseFloat(t.toFixed(3)) * 100).toFixed(1);
      }
      if (i["storeType"] === 'STORE_TYPE_LINKS') {
        var t = i['used'] / i['limit'];
        userData.userLinkStorage = (parseFloat(t.toFixed(3)) * 100).toFixed(1);
      }
      if (i["storeType"] === 'STORE_TYPE_REACTIONS') {
        var t = i['used'] / i['limit'];
        userData.userReactionStorage = (parseFloat(t.toFixed(3)) * 100).toFixed(1);
      }
      if (i["storeType"] === 'STORE_TYPE_USER_DATA') {
        userData.userDataStorage = i['used'] - 1;
      }
    })

    console.log('Fetch Complete!')
    console.log(userData.userCastStorage);
    console.log(userData.userLinkStorage);
    console.log(userData.userReactionStorage);
    console.log(userData.userDataStorage);

  } catch (e) {
    // Enhanced error logging
    if (axios.isAxiosError(e)) {
      console.error("Axios error:", e.message);
      if (e.response) {
        console.error("Response data:", e.response.data);
        console.error("Response status:", e.response.status);
        console.error("Response headers:", e.response.headers);
      }
    } else {
      console.error("Unexpected error:", e);
    }
  }
}


//-------------------------------------------
const { Box, Heading, Text, VStack, HStack, vars } = createSystem({
  colors: {
    customBackground: '#453ECA',
    customText: '#F7F6FC',
  },
  fonts: {
    default: [
      {
        name: 'Inter',
        source: 'google',
        weight: 500,
      },
    ]
  }
})
// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }

const BASE_URL = process.env.PUBLIC_URL || 'http://localhost:5173'

export const app = new Frog({
  assetsPath: '/',
  ui: { vars },
  basePath: '/api',
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})

app.use('/*', serveStatic({ root: './public' }));

app.frame('/', (c) => {
  //const initFrame = `${BASE_URL}/background.png`;
  return c.res({
    //action: '/status',
    image:
      <Box
        grow
        alignVertical="space-between"
        backgroundColor="customBackground"
        color="customText"
        padding="24"
      >
        <VStack>
          <HStack><Text size="32" weight="700" children="">Press the button below</Text></HStack>
          <HStack><Text size="32" children="">to check your</Text></HStack>
          <HStack><Text size="32" children="">storage status</Text></HStack>
        </VStack>
        <HStack alignHorizontal="center" alignVertical='bottom'>
          <Text size="64" children="">&darr;&darr;&darr;</Text>
        </HStack>
      </Box>
    ,
    intents: [
      <Button action='/status' children='' value="myStats">Check My Stats</Button>,
    ],
  })
})


app.frame('/status', async (c) => {

  const id = c.frameData!.fid;
  await main(id);
  var castTextSignal, reactionTextSignal, linkTextSignal;

  var determineSignalFunction = (value: string) => {
    console.log('Determine Signal Function Executed!')
    var val = parseFloat(value);
    if (val > 100) {
      return <Text children=''>&#x1F7E6;</Text>
    }
    else if (val > 75 && val <= 100) {
      return <Text children=''>&#x1F7E7;</Text>
    } else if (val <= 75 && val > 25) {
      return <Text children=''>&#x1F7E8;</Text>
    }
    return <Text children=''>&#x1F7E9;</Text>
  }

  castTextSignal = determineSignalFunction(userData.userCastStorage);
  reactionTextSignal = determineSignalFunction(userData.userReactionStorage);
  linkTextSignal = determineSignalFunction(userData.userLinkStorage);

  console.log(`/Status(cast) : ${userData.userCastStorage}`);

  console.log(`/Status(link) : ${userData.userLinkStorage}`);

  console.log(`/Status(reaction) : ${userData.userReactionStorage}`);

  return c.res({
    imageAspectRatio: '1.91:1',
    action: '/',
    image: (
      <Box
        grow
        alignVertical="center"
        backgroundColor="customBackground"
        color="customText"
        padding="32"
      >
        <VStack gap="12">
          <HStack>
            <Heading children='' weight='700'>FID: {id}</Heading>
          </HStack>
          <Box height='8'></Box>
          <VStack gap="8">
            <HStack gap="4">
              <Text children='' weight='600'>Cast Storage</Text>
              <Text children=''>{castTextSignal} </Text>
              <Text children=''>
                : {userData.userCastStorage}%
              </Text>
            </HStack>
            <HStack gap="4">
              <Text children=''>Reaction Storage</Text>
              <Text children=''>{reactionTextSignal} </Text>
              <Text children=''>
                : {userData.userReactionStorage}%
              </Text>
            </HStack>
            <HStack gap="4">
              <Text children=''>Link Storage</Text>
              <Text children=''>{linkTextSignal} </Text>
              <Text children=''>
                : {userData.userLinkStorage}%
              </Text>
            </HStack>
            <HStack gap="4">
              <Text children=''>Total # of storages you have purchased : </Text>
              <Text children=''>{userData.userDataStorage}</Text>
            </HStack>
          </VStack>
          <Box height='32'></Box>
          <HStack alignHorizontal='space-between' alignVertical='bottom'>
            <Text children='' size="14" >Storage Capacity Indicator : [ &#x1F7E9; &#x1F7E9; &#x1F7E8; &#x1F7E7; ]</Text>
            <Text children='' size="12" >Frame created by : @flutter</Text>
          </HStack>
        </VStack>
      </Box>
    ),
    intents: [
      //<Button.AddCastAction children='' action='/gm'>Share</Button.AddCastAction>,
      <Button.Reset children=''>Reset</Button.Reset>
      //<Button.AddCastAction children='' action='addCastAction'>Share</Button.AddCastAction>
    ],
  })

})

// Devtools should be called after all frames are defined
// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
