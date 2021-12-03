import { useContext } from "react";
import AppContext from "../utils/AppContext";
import RPS from "../artifacts/contracts/RPS.sol/RPS.json";
import { Button, IconButton } from "@chakra-ui/button";
import { CopyIcon } from "@chakra-ui/icons";
import { Input } from "@chakra-ui/input";
import { useClipboard } from "@chakra-ui/hooks";

import {
  Center,
  HStack,
  VStack,
  Text,
  Box,
  GridItem,
  Grid,
  Wrap,
  WrapItem,
  Divider,
} from "@chakra-ui/layout";
import React from "react";

import { useColorMode } from "@chakra-ui/color-mode";
import { GameAlert } from "./GameAlert";
import { Spinner, useToast } from "@chakra-ui/react";
import { Bet } from "./Bet";
import { Icon } from "@iconify/react";
import { ethers } from "ethers";

const rpsAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const salt = ethers.utils.randomBytes(32);
const encrypt = (salt, choice) => {
  const commitment = ethers.utils.solidityKeccak256(
    ["uint", "uint8"],
    [ethers.BigNumber.from(salt), choice]
  );
  return commitment;
};

export const ControlPanel = () => {
  const { colorMode } = useColorMode();
  const value = useContext(AppContext);
  const toast = useToast();
  console.log("global state:", value);
  const { hasCopied, onCopy } = useClipboard(value.state.gameId);

  const requestAccount = async () => {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  };

  const sendCommitment = async () => {
    const commitment = encrypt(salt, value.state.choice);
    if (typeof window.ethereum !== "undefined") {
      try {
        await requestAccount();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const contract = new ethers.Contract(rpsAddress, RPS.abi, signer);
        const overrides = {
          // To convert Ether to Wei:
          value: ethers.utils.parseEther(value.state.bet.toString()),
          // ether in this case MUST be a string
        };
        const transaction = await contract.sendCommitment(
          value.state.bytesGameId,
          commitment,
          value.state.username,
          overrides
        );
        await transaction.wait();
        value.setStatus("Waiting for opponent's commitment...");
        checkEvents();
        toast({
          title: "Commitment Received!",
          description: "Your choice has been encrypted.",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      } catch (err) {
        console.error(err);
        toast({
          title: "Commitment Failed!",
          description: "Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      }
    } else {
      toast({
        title: "No Web3 Provider Found!",
        description: "Please install MetaMask and try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const sendVerification = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await requestAccount();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(rpsAddress, RPS.abi, signer);
        const transaction = await contract.sendVerification(
          value.state.bytesGameId,
          value.state.choice,
          ethers.BigNumber.from(salt)
        );
        await transaction.wait();
        value.setStatus("Waiting for opponent's verification...");

        toast({
          title: "Verification Confirmed!",
          description: "Your choice has been verified.",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      } catch (err) {
        console.error(err);
        toast({
          title: "Verification Failed!",
          description: "Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      }
    } else {
      toast({
        title: "No Web3 Provider Found!",
        description: "Please install MetaMask and try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const checkEvents = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(rpsAddress, RPS.abi, provider);
        contract.on("requestMoves", (gameId) => {
          if (gameId !== value.state.bytesGameId) {
            return;
          }
          value.setStatus("Waiting for your verification...");
          toast({
            title: "Opponent Committed!",
            description: "Please verify your choice",
            status: "info",
            duration: 5000,
            isClosable: true,
            position: "top-right",
          });
        });

        contract.on("winner", async (gameId, winnerAddress) => {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          if (gameId !== value.state.bytesGameId) {
            return;
          }
          value.setStatus("Game finished! GG!");
          if (winnerAddress === "0x0000000000000000000000000000000000000000") {
            value.setOutcome("tie");
          } else if (winnerAddress === address) {
            value.setOutcome("win");
          } else {
            value.setOutcome("loss");
          }
        });
      } catch (err) {
        console.error("Error: ", err);
      }
    }
  };

  return (
    <Center mt={2}>
      <VStack>
        <GameAlert outcome={value.state.outcome} />
        <Box
          boxShadow={colorMode === "light" ? "md" : "dark-lg"}
          maxW="md"
          borderRadius="lg"
          overflow="hidden"
          m={3}
        >
          <Box p={4}>
            <Grid
              templateRows="repeat(5, 1fr)"
              templateColumns="repeat(6, 1fr)"
              rowGap={0.5}
              columnGap={4}
            >
              <GridItem rowSpan={1} colSpan={1}>
                <Text mt={1} fontWeight="bold">
                  Username
                </Text>{" "}
              </GridItem>
              <GridItem rowSpan={1} colSpan={5}>
                <Input
                  disabled={
                    value.state.status !== "Waiting for your commitment..."
                  }
                  rounded="lg"
                  size="sm"
                  value={value.state.username}
                  placeholder="New Player"
                  variant="filled"
                  onChange={(e) => value.setUsername(e.target.value)}
                />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <Text mt={1} fontWeight="bold">
                  Game ID
                </Text>
              </GridItem>
              <GridItem rowSpan={1} colSpan={5}>
                <HStack>
                  <Input
                    rounded="lg"
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
              <GridItem rowSpan={1} colSpan={1}>
                <Text mt={1} fontWeight="bold">
                  Status
                </Text>
              </GridItem>
              <GridItem rowSpan={1} colSpan={5}>
                <HStack
                  mt={value.state.status !== "Game finished! GG!" ? 1 : 0}
                  spacing={3}
                >
                  {value.state.status !== "Game finished! GG!" && (
                    <Spinner size="md" speed="0.9s" />
                  )}
                  <Text mt={1}>{value.state.status}</Text>
                </HStack>
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <Text mt={1} fontWeight="bold">
                  Your Bet
                </Text>
              </GridItem>
              <GridItem rowSpan={1} colSpan={5}>
                <Bet />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <Text mt={3} fontWeight="bold">
                  Choice
                </Text>
              </GridItem>
              <GridItem rowSpan={1} colSpan={5}>
                <Center mt={2}>
                  <HStack>
                    <IconButton
                      colorScheme={value.state.choice === 1 ? "blue" : "gray"}
                      onClick={() => value.setChoice(1)}
                      pl={8}
                      pr={8}
                      size="md"
                      aria-label="ROCK"
                      icon={<Icon rotate="90deg" icon="fa-solid:hand-rock" />}
                    />
                    <IconButton
                      colorScheme={value.state.choice === 2 ? "blue" : "gray"}
                      onClick={() => value.setChoice(2)}
                      pl={8}
                      pr={8}
                      size="md"
                      aria-label="PAPER"
                      icon={<Icon icon="fa-solid:hand-paper" />}
                    />
                    <IconButton
                      colorScheme={value.state.choice === 3 ? "blue" : "gray"}
                      onClick={() => value.setChoice(3)}
                      rotate="90deg"
                      pl={8}
                      pr={8}
                      size="md"
                      aria-label="SCISSORS"
                      icon={<Icon icon="fa-solid:hand-scissors" />}
                    />
                  </HStack>
                </Center>
              </GridItem>
            </Grid>
            <Divider mt={5} />
            <Grid mt={2} templateRows="1" templateColumns="1">
              <GridItem owSpan={1} colSpan={6}>
                <Wrap mt={3} justify="right">
                  <WrapItem>
                    <Button
                      onClick={sendCommitment}
                      colorScheme="blue"
                      disabled={
                        value.state.choice === 0 ||
                        value.state.status !== "Waiting for your commitment..."
                      }
                    >
                      Submit
                    </Button>
                  </WrapItem>
                  <WrapItem>
                    <Button
                      onClick={sendVerification}
                      colorScheme="teal"
                      disabled={
                        value.state.status !==
                        "Waiting for your verification..."
                      }
                    >
                      Verify
                    </Button>
                  </WrapItem>
                  <WrapItem>
                    <Button
                      colorScheme="teal"
                      onClick={() => null}
                      disabled={value.state.status !== "Game finished! GG!"}
                    >
                      Replay
                    </Button>
                  </WrapItem>
                </Wrap>
              </GridItem>
            </Grid>
          </Box>
        </Box>
      </VStack>
    </Center>
  );
};
