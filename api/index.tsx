import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
import { userData, main } from './userStorage.js'
import {
  getFarcasterUserDetails,
  validateFramesMessage,
} from "@airstack/frog";
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/vercel'
import { createSystem } from 'frog/ui'

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


//const BASE_URL = process.env.PUBLIC_URL || 'http://localhost:5173'

const BASE_URL = process.env.PUBLIC_URL


export const app = new Frog({
  assetsPath: '/',
  ui: { vars },
  basePath: '/api',
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})


app.frame('/', (c) => {
  const initFrame = `${BASE_URL}/init_frame.png`
  return c.res({
    action: '/status',
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
          <Text size="64" children="">&#8681; &#8681; &#8681;</Text>
        </HStack>
      </Box>
    ,
    intents: [
      <Button children='' value="myStats">Check My Stats</Button>,
    ],
  })
})


app.frame('/status', async (c) => {

  //const { status } = c
  const id = c.frameData!.fid;
  await main(id);

  // console.log("User Cast Storage:", userData.userCastStorage);
  // console.log("User Reaction Storage:", userData.userReactionStorage);
  // console.log("User Link Storage:", userData.userLinkStorage);
  // console.log("User Data Storage:", userData.userDataStorage);

  var castTextSignal, reactionTextSignal, linkTextSignal;

  var determineSignalFunction = (value: string) => {
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

  return c.res({
    imageAspectRatio: '1.91:1',
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
            <Text children='' size="14" >Storage Indicator : [ &#x1F7E9; &#x1F7E9; &#x1F7E8; &#x1F7E7; ]</Text>
            <Text children='' size="12" >Frame created by : @flutter</Text>
          </HStack>

        </VStack>

      </Box>
    ),
    intents: [
      //<Button.AddCastAction children='' action='/gm'>Share</Button.AddCastAction>,
      <Button.Reset children=''>Reset</Button.Reset>,
    ],
  })

})

//To post a cast
// app.hono.post("/gm", async (c) => {
//   const body = await c.req.json();

//   // validate the POST body
//   const { isValid, message } = await validateFramesMessage(body);
//   const interactorFid = message?.data?.fid;
//   const castFid = message?.data.frameActionBody.castId?.fid as number;
//   if (isValid) {
//     // Check if trying to `GM` themselves
//     if (interactorFid === castFid) {
//       return c.json({ message: "Nice try." }, 400);
//     }

//     // Fetch user profile name
//     const { data, error } = await getFarcasterUserDetails({
//       fid: castFid,
//     });

//     if (error) {
//       return c.json({ message: "Error. Try Again." }, 500);
//     }

//     let message = `GM ${data?.profileName}!`;
//     if (message.length > 30) {
//       message = "GM!";
//     }

//     return c.json({ message });
//   } else {
//     return c.json({ message: "Unauthorized" }, 401);
//   }
// });

// Devtools should be called after all frames are defined
// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
