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
  Heading,
  HStack,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/layout";

const rpsAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const salt = Math.random().toString();

const Play = () => {
  const value = useContext(AppContext);
  console.log(value);
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

  return (
    <>
      <NavBar />
      <br />

      <Container maxW={"3xl"}>
        <Stack
          as={Box}
          textAlign={"center"}
          spacing={{ base: 4, md: 4 }}
          py={{ base: 20, md: 36 }}
        >
          <Heading>Pick Wisely.</Heading>
          <Center>
            <HStack>
              <IconButton
                colorScheme={choice === "ROCK" ? "green" : "gray"}
                size="lg"
                aria-label="ROCK"
                icon={<Icon icon="fa-solid:hand-rock" />}
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
