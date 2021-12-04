import { useContext, useState, useEffect } from "react";
import AppContext from "../utils/AppContext";
import RPS from "../artifacts/contracts/RPS.sol/RPS.json";
import { IconButton } from "@chakra-ui/button";
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
  Divider,
  SimpleGrid,
} from "@chakra-ui/layout";

import { useColorMode } from "@chakra-ui/color-mode";
import { GameAlert } from "./GameAlert";
import { Spinner, useToast } from "@chakra-ui/react";
import { Bet } from "./Bet";
import { Icon } from "@iconify/react";
import { ethers } from "ethers";
import { CancelButton } from "./Buttons/CancelButton";
import { ReplayButton } from "./Buttons/ReplayButton";
import { VerificationButton } from "./Buttons/VerificationButton";
import { CommitmentButton } from "./Buttons/CommitmentButton";
import { Search } from "./Search";

const rpsAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";
const salt = ethers.utils.randomBytes(32);
const encrypt = (salt, choice) => {
  const commitment = ethers.utils.solidityKeccak256(
    ["uint", "uint8"],
    [ethers.BigNumber.from(salt), choice]
  );
  return commitment;
};
const isAddress = /0x[a-fA-F0-9]{40}$/;

export const ControlPanel = () => {
  const { colorMode } = useColorMode();
  const value = useContext(AppContext);
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [score, setScore] = useState([]);
  const [player, setPlayer] = useState("");
  const [gameDetails, setGameDetails] = useState(null);
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
        const playerUsername =
          value.state.username.length === 0
            ? "New Player"
            : value.state.username;
        const overrides = {
          // To convert Ether to Wei:
          value: ethers.utils.parseEther(value.state.bet.toString()),
          // ether in this case MUST be a string
        };
        const transaction = await contract.sendCommitment(
          value.state.bytesGameId,
          commitment,
          playerUsername,
          overrides
        );
        await transaction.wait();
        value.setStatus("Waiting for opponent's commitment...");
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

  const cancel = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await requestAccount();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(rpsAddress, RPS.abi, signer);
        await contract.requestRefund(value.state.bytesGameId);
        value.setStatus("Cancellation in progress...");
        value.setDisableCancel(true);
      } catch (err) {
        console.error(err);
        toast({
          title: "Cancellation Failed!",
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

  const sendSearch = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await requestAccount();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(rpsAddress, RPS.abi, signer);
        if (isAddress.test(query)) {
          const transaction = await contract.getPlayerDetails(query);
          setPlayer(query);
          const [wins, losses, earnings] = transaction;
          setGameDetails(null);
          setScore([
            wins.toString(),
            losses.toString(),
            ethers.utils.formatEther(earnings.toString()),
          ]);
        } else {
          const transaction = await contract.getGameDetails(
            ethers.utils.id(query)
          );

          const gameDetails = {
            ...transaction,
            bet: ethers.utils.formatEther(transaction.bet.toString()),
          };
          setScore([]);
          setPlayer("");
          setGameDetails(gameDetails);
        }
        toast({
          title: "Query Returned!",
          description: "You have read the blockchain.",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      } catch (err) {
        console.error(err);
        toast({
          title: "Query Failed!",
          description: "Player or game not found.",
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

        contract.on("gameCancel", (gameId) => {
          if (gameId !== value.state.bytesGameId) {
            return;
          }
          value.setStatus("Game cancelled!");
          toast({
            title: "Game Cancelled!",
            description: "Your bets have been refunded",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "top-right",
          });
        });
      } catch (err) {
        console.error("Error: ", err);
      }
    }
  };

  useEffect(() => {
    checkEvents();
  }, []);

  return (
    <Center mt={2} mx={2}>
      <VStack>
        <GameAlert outcome={value.state.outcome} />
        <Box
          boxShadow={colorMode === "light" ? "lg" : "dark-lg"}
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
              overflow="auto"
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
                  mt={
                    value.state.status === "Game finished! GG!" ||
                    value.state.status === "Game cancelled!"
                      ? 0
                      : 1
                  }
                  spacing={3}
                >
                  {value.state.outcome === "unknown" &&
                    value.state.status !== "Game cancelled!" && (
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
            <Divider mt={4} />
            <Center mt={4}>
              <Search
                sendSearch={sendSearch}
                query={query}
                setQuery={setQuery}
                gameDetails={gameDetails}
                score={score}
                player={player}
              />
              <SimpleGrid ml={2} columns={4} spacing={2}>
                <CommitmentButton sendCommitment={sendCommitment} />

                <VerificationButton sendVerification={sendVerification} />

                <ReplayButton />

                <CancelButton cancel={cancel} />
              </SimpleGrid>
            </Center>
          </Box>
        </Box>
      </VStack>
    </Center>
  );
};
