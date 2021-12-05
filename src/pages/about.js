import { useColorMode } from "@chakra-ui/color-mode";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Image } from "@chakra-ui/image";
import {
  Box,
  Center,
  Container,
  Heading,
  Link,
  SimpleGrid,
  Text,
  UnorderedList,
} from "@chakra-ui/layout";
import { Step } from "../components/Step";
import { Creator } from "../components/Creator";
import Footer from "../components/Footer";

const About = () => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const darkLink = "teal.200";
  const lightLink = "blue.600";
  const lightSection = "gray.50";
  const darkSection = "gray.900";
  const steps = [
    "Find an opponent that you can contact & send them your game ID",
    "Agree on a bet together and commit your choice when ready",
    "Once both players have committed, you must verify your choice",
    "When both players have verified, the game determines the winner",
    "The winner will be paid double their bet. The loser will get nothing",
    "Search for stats by address or by game ID using the search button",
  ];
  return (
    <>
      <Box mb={["3rem", "6rem"]}>
        <Center>
          <Box maxW="3xl" my={2} mx={3}>
            <Heading mt={12}>
              A simple, decentralized rock paper scissors game that runs on the{" "}
              <Link
                color={isDark ? darkLink : lightLink}
                href="https://ethereum.org/en/"
                isExternal
              >
                Ethereum blockchain
              </Link>
              .
            </Heading>
          </Box>
        </Center>
        {/* <Center mt={[10, 20]}>
          <HStack spacing={0} pr={2.5}>
            <Icon icon="mdi:ethereum" fontSize={"5rem"} />
            <Heading fontSize="5rem">EthRPS</Heading>
          </HStack>
        </Center> */}
        <SimpleGrid columns={[0, 2]} mx={[0, 20]} mt={[10, 20]}>
          <Container maxW="3xl" m={2}>
            <Heading>How to Play:</Heading>
            <UnorderedList mr={[0, 10]}>
              <Box mt={3}>
                {steps.map((step, i) => (
                  <Step key={i} content={step} />
                ))}
              </Box>
            </UnorderedList>
          </Container>
          <Container maxW="3xl" mx={2} mt={[8, 0]}>
            <Heading>Features</Heading>
            <Box mt={3} mr={[0, 10]}>
              <Text fontSize="xl">
                To prevent the second player from having an advantage by reading
                the blockchain, each player is securely generated a nonce
                client-side. This nonce is hashed with the player
                {"'"}s choice and sent as a commitment. Players will only reveal
                their choice when the contract has seen both commitments. A game
                in progress may be cancelled at any time to fully refund both
                players.
              </Text>
              <Text fontSize="xl" mt={3}></Text>
            </Box>
          </Container>
        </SimpleGrid>
        <Center mt={20}>
          <Heading fontSize="3rem" mt={2} mx={4}>
            About the Creators
          </Heading>
        </Center>
        <SimpleGrid columns={[0, 2]} mx={[0, 20]} mt={[20, 20]}>
          <Box>
            <Creator
              name="Freeman Jiang"
              subtitle="Computer Science @University of Waterloo | 18"
              description="Hey! I'm a full stack web developer and aspiring full stack Ethereum developer! I created the UI in React, connected it using Ethers.js, and deployed the contract to the blockchain."
              img="/freemanjiang.jpeg"
            />
          </Box>
          <Box mt={[20, 0]}>
            <Creator
              name="Jason Yuan"
              subtitle="Software Engineering @University of Waterloo  | 18"
              description="Hi! I am a systems & backend developer currently learning the Solidity language. I implemented the contract logic for EthRPS and look forward to learning more about blockchain."
              img="/jasonyuan.jpg"
            />
          </Box>
        </SimpleGrid>
      </Box>
      <Footer />
    </>
  );
};

export default About;
