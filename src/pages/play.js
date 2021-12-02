import { useState, useContext } from "react";
import AppContext from "../utils/AppContext";
import { ethers } from "ethers";
import RPS from "../artifacts/contracts/RPS.sol/RPS.json";
import { Button, IconButton } from "@chakra-ui/button";
import { Icon } from "@iconify/react";
import NavBar from "../components/NavBar";
import {
  Box,
  Center,
  Container,
  Grid,
  GridItem,
  Heading,
  HStack,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/layout";
import { Input } from "@chakra-ui/input";
import { CopyIcon } from "@chakra-ui/icons";
import { useClipboard } from "@chakra-ui/react";

const rpsAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const salt = Math.random().toString();

const Play = () => {
  const value = useContext(AppContext);
  console.log(value);
  // if (value.state.username === "") {
  //   value.setUsername("New Player");
  // }
  const [choice, setChoice] = useState("");

  const requestAccount = async () => {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  };

  const sendCommitment = async () => {
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(rpsAddress, RPS.abi, signer);
      const transaction = await contract.sendCommitment(choice, salt);
      await transaction.wait();
      console.log(`Commitment: ${choice} sent`);
    }
  };

  const sendMove = async () => {
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(rpsAddress, RPS.abi, signer);
      const transaction = await contract.sendMove(choice, salt);
      await transaction.wait();
      console.log(`sendMove sent with choice: ${choice}, salt: ${salt}`);
    }
  };

  const determineWinner = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(rpsAddress, RPS.abi, provider);
      try {
        const data = await contract.determineWinner();
        console.log("data: ", data);
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  };

  const { hasCopied, onCopy } = useClipboard(value.state.gameId);

  return (
    <>
      <NavBar />
      <br />
      <Center>
        <Box
          boxShadow="md"
          // p={1}
          // borderWidth="1px"
          maxW="md"
          borderRadius="lg"
          overflow="hidden"
          ml={3}
        >
          <Box p={3}>
            <Grid
              templateRows="repeat(2, 1fr)"
              templateColumns="repeat(6, 1fr)"
              gap={2}
            >
              <GridItem rowSpan={1} colSpan={1}>
                <Text mt={1} fontWeight="bold">
                  Username:
                </Text>{" "}
              </GridItem>
              <GridItem rowSpan={1} colSpan={5}>
                <Input
                  rounded="lg"
                  ml={2}
                  size="sm"
                  value={value.state.username}
                  placeholder="New Player"
                  variant="filled"
                  onChange={(e) => value.setUsername(e.target.value)}
                />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <Text mt={1} fontWeight="bold">
                  Game ID:
                </Text>
              </GridItem>
              <GridItem rowSpan={1} colSpan={5}>
                <HStack>
                  <Input
                    rounded="lg"
                    ml={2}
                    size="sm"
                    isReadOnly
                    value={value.state.gameId}
                    variant="filled"
                  />
                  <IconButton
                    size="sm"
                    aria-label="Copy game ID"
                    onClick={() => {
                      onCopy();
                    }}
                    icon={<CopyIcon />}
                  />
                </HStack>
              </GridItem>
            </Grid>
          </Box>
        </Box>
      </Center>
      <Container maxW={"3xl"}>
        <Stack
          as={Box}
          textAlign={"center"}
          spacing={{ base: 4, md: 4 }}
          py={{ base: 4, md: 8 }}
        >
          <Heading>Pick Wisely.</Heading>
          <Center>
            <HStack>
              <IconButton
                colorScheme={choice === "ROCK" ? "green" : "gray"}
                size="lg"
                aria-label="ROCK"
                icon={<Icon rotate="90deg" icon="fa-solid:hand-rock" />}
                onClick={() => setChoice("ROCK")}
              />
              <IconButton
                colorScheme={choice === "PAPER" ? "green" : "gray"}
                size="lg"
                aria-label="PAPER"
                icon={<Icon icon="fa-solid:hand-paper" />}
                onClick={() => setChoice("PAPER")}
              />
              <IconButton
                colorScheme={choice === "SCISSORS" ? "green" : "gray"}
                rotate="90deg"
                size="lg"
                aria-label="SCISSORS"
                icon={<Icon icon="fa-solid:hand-scissors" />}
                onClick={() => setChoice("SCISSORS")}
              />
            </HStack>
          </Center>
          <VStack>
            <HStack mt={1}>
              <Button
                colorScheme="blue"
                onClick={sendCommitment}
                disabled={choice === "" && true}
              >
                Submit
              </Button>
              <Button
                colorScheme="teal"
                onClick={sendMove}
                disabled={choice === "" && true}
              >
                Verify
              </Button>
              <Button onClick={determineWinner}>Winner</Button>
            </HStack>
          </VStack>
        </Stack>
      </Container>
    </>
  );
};

export default Play;
