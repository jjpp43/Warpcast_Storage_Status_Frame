import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
import { Box, Heading, Text, VStack, HStack, vars } from '../ui/ui.js'
import { userDataStorage, userCastStorage, userLinkStorage, userReactionStorage } from './user_storage.js'

// import { neynar } from 'frog/hubs'
import { handle } from 'frog/vercel'

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
      <Button value="myStats">Check My Stats</Button>,
    ],
  })
})



app.frame('/status', (c) => {
  const { status } = c
  const userId = c.frameData?.fid;
  var castTextSignal, reactionTextSignal, linkTextSignal;

  var determineSignalFunction = (val: number) => {
    if (val > 100) {
      return <Text>&#x1F7E6;</Text>
    }
    else if (val > 75 && val <= 100) {
      return <Text>&#x1F7E7;</Text>
    } else if (val <= 75 && val > 25) {
      return <Text>&#x1F7E8;</Text>
    }
    return <Text>&#x1F7E9;</Text>

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
            <Heading weight='700'>FID: {userId}</Heading>
          </HStack>
          <Box height='8'></Box>
          <VStack gap="8">
            <HStack gap="4">
              <Text weight='600'>Cast Storage</Text>
              <Text>{castTextSignal} </Text>
              <Text>
                : {userCastStorage.toFixed(1)}%
              </Text>
            </HStack>
            <HStack gap="4">
              <Text>Reaction Storage</Text>
              <Text>{reactionTextSignal} </Text>
              <Text>
                : {userReactionStorage.toFixed(1)}%
              </Text>
            </HStack>
            <HStack gap="4">
              <Text>Link Storage</Text>
              <Text>{linkTextSignal} </Text>
              <Text>
                : {userLinkStorage.toFixed(1)}%
              </Text>
            </HStack>
            <HStack gap="4">
              <Text>Total # of storages you have purchased : </Text>
              <Text>{userDataStorage}</Text>
            </HStack>
          </VStack>
          <Box height='32'></Box>
          <HStack>
            <Text size="12">Storage Indicator : [ &#x1F7E9; &#x1F7E9; &#x1F7E8; &#x1F7E7; ]</Text>
          </HStack>
        </VStack>

      </Box>
    ),
    intents: [
      <Button.AddCastAction action='/'>Share</Button.AddCastAction>,
      status === 'response' && <Button.Reset>Reset</Button.Reset>,
    ],
  })

})

// Handle user data


// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
