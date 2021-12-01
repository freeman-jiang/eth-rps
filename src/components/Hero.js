import Link from "next/link";
import {
  Box,
  Heading,
  Container,
  Text,
  Button,
  Stack,
  Icon,
  useColorModeValue,
  createIcon,
} from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";

export const Hero = () => {
  return (
    <>
      {/* <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap"
          rel="stylesheet"
        />
      </Head> */}
      <Container maxW={"3xl"}>
        <Stack
          as={Box}
          textAlign={"center"}
          spacing={{ base: 8, md: 12 }}
          py={{ base: 20, md: 36 }}
        >
          <Heading
            fontWeight={600}
            fontSize={{ base: "2xl", sm: "4xl", md: "6xl" }}
            lineHeight={"110%"}
          >
            Play Rock Paper Scissors. <br />
            Win{" "}
            <Text as={"span"} color={"green.400"}>
              $ETH
            </Text>
          </Heading>
          <Text color={"gray.500"}>
            {
              " Choices are encrypted and stored securely on the Ethereum blockchain."
            }
            <br />
            {
              "Winner takes all, but don't worry—you're probably on the test network."
            }
          </Text>
          <Stack
            direction={"column"}
            spacing={3}
            align={"center"}
            alignSelf={"center"}
            position={"relative"}
          >
            <Link href="/play" passHref>
              <Button
                colorScheme={"green"}
                bg={"green.400"}
                size="lg"
                boxShadow="xl"
                rounded={"full"}
                mb={1}
                _hover={{
                  bg: "green.500",
                }}
              >
                Play Now <ArrowForwardIcon ml={2} />
              </Button>
            </Link>
          </Stack>
        </Stack>
      </Container>
    </>
  );
};
