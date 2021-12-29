import { Box, Heading, Container, Text, Stack } from "@chakra-ui/react";
import { CreateButton } from "./Buttons/CreateButton";
import { JoinButton } from "./Buttons/JoinButton";

export const Hero = () => {
  return (
    <>
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
            {"Choices are encrypted and stored securely on the blockchain."}
            <br />
            {
              "Please ensure your selected network matches the network in Metamask."
            }
          </Text>
          <Stack
            direction={"column"}
            spacing={3}
            align={"center"}
            alignSelf={"center"}
            position={"relative"}
          >
            <CreateButton />
            <JoinButton />
          </Stack>
        </Stack>
      </Container>
    </>
  );
};
