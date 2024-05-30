import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
import { userDataStorage, userCastStorage, userLinkStorage, userReactionStorage } from './user_storage.tsx'
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
  }
})
// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }


const BASE_URL = process.env.PUBLIC_URL || 'http://localhost:5173'


export const app = new Frog({
  ui: { vars },
  assetsPath: '/',
  basePath: '/api',
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})



app.frame('/', (c) => {
  const initFrame = `${BASE_URL}/init_frame.png`
  return c.res({
    action: '/status',
    image: initFrame,
    intents: [
      <Button children='' value="myStats">Check My Stats</Button>,
    ],
  })
})



app.frame('/status', (c) => {
  const { status } = c
  const userId = c.frameData?.fid;
  var castTextSignal, reactionTextSignal, linkTextSignal;

  var determineSignalFunction = (val: number) => {
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

  castTextSignal = determineSignalFunction(userCastStorage);
  reactionTextSignal = determineSignalFunction(userReactionStorage);
  linkTextSignal = determineSignalFunction(userLinkStorage);



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
            <Heading children='' weight='700'>FID: {userId}</Heading>
          </HStack>
          <Box height='8'></Box>
          <VStack gap="8">
            <HStack gap="4">
              <Text children='' weight='600'>Cast Storage</Text>
              <Text children=''>{castTextSignal} </Text>
              <Text children=''>
                : {userCastStorage.toFixed(1)}%
              </Text>
            </HStack>
            <HStack gap="4">
              <Text children=''>Reaction Storage</Text>
              <Text children=''>{reactionTextSignal} </Text>
              <Text children=''>
                : {userReactionStorage.toFixed(1)}%
              </Text>
            </HStack>
            <HStack gap="4">
              <Text children=''>Link Storage</Text>
              <Text children=''>{linkTextSignal} </Text>
              <Text children=''>
                : {userLinkStorage.toFixed(1)}%
              </Text>
            </HStack>
            <HStack gap="4">
              <Text children=''>Total # of storages you have purchased : </Text>
              <Text children=''>{userDataStorage}</Text>
            </HStack>
          </VStack>
          <Box height='32'></Box>
          <HStack>
            <Text children='' size="14" weight='700'>Storage Indicator : [ &#x1F7E9; &#x1F7E9; &#x1F7E8; &#x1F7E7; ]</Text>
          </HStack>
        </VStack>

      </Box>
    ),
    intents: [
      <Button.AddCastAction children='' action='/gm'>Share</Button.AddCastAction>,
      status === 'response' && <Button.Reset children=''>Reset</Button.Reset>,
    ],
  })

})

//To post a cast
app.hono.post("/gm", async (c) => {
  const body = await c.req.json();

  // validate the POST body
  const { isValid, message } = await validateFramesMessage(body);
  const interactorFid = message?.data?.fid;
  const castFid = message?.data.frameActionBody.castId?.fid as number;
  if (isValid) {
    // Check if trying to `GM` themselves
    if (interactorFid === castFid) {
      return c.json({ message: "Nice try." }, 400);
    }

    // Fetch user profile name
    const { data, error } = await getFarcasterUserDetails({
      fid: castFid,
    });

    if (error) {
      return c.json({ message: "Error. Try Again." }, 500);
    }

    let message = `GM ${data?.profileName}!`;
    if (message.length > 30) {
      message = "GM!";
    }

    return c.json({ message });
  } else {
    return c.json({ message: "Unauthorized" }, 401);
  }
});


// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
