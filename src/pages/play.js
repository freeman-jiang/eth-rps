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
import { useClipboard, useToast } from "@chakra-ui/react";
import { GameStatus } from "../components/GameStatus";

const rpsAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const salt = Math.random().toString();

const Play = () => {
  const toast = useToast();
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
    toast({
      title: "Congratulations!",
      description: "You won 2 ETH",
      status: "success",
      duration: 7000,
      isClosable: true,
      size: "lg",
      variant: "solid",
      position: "top",
    });
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
      <GameStatus />
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
      {/* <GameStatus /> */}
    </>
  );
};

export default Play;
