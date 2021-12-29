import { useContext, useState, useEffect } from "react";
import AppContext from "../utils/AppContext";
import RPS from "../../contracts/RPS.json";
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
import { Select, Spinner, useToast } from "@chakra-ui/react";
import { Bet } from "./Bet";
import { Icon } from "@iconify/react";
import { ethers } from "ethers";
import { CancelButton } from "./Buttons/CancelButton";
import { ReplayButton } from "./Buttons/ReplayButton";
import { VerificationButton } from "./Buttons/VerificationButton";
import { CommitmentButton } from "./Buttons/CommitmentButton";
import { Search } from "./Search";
import { Status } from "./Status";

// const rpsAddress = "0x940E847a290582FAb776F8Ae794f23D9B660a6d2"; // L1 Ropsten Test Network
const ropstenAddress = "0x67cA0B42756B388387d9643C70626bA8CE57Aa9e"; // L1 Ropsten Test Network
const arbitrumAddress = "0x940E847a290582FAb776F8Ae794f23D9B660a6d2"; // L2 Arbitrum Rinkeby
const polygonAddress = "0x8Be503bcdEd90ED42Eff31f56199399B2b0154CA"; // L2 Polygon Mumbai

const nonce = ethers.utils.randomBytes(32);
const encrypt = (nonce, choice) => {
  const commitment = ethers.utils.solidityKeccak256(
    ["uint", "uint8"],
    [ethers.BigNumber.from(nonce), choice]
  );
  return commitment;
};
const isAddress = /^0x[a-fA-F0-9]{40}$/;

export const ControlPanel = () => {
  const { colorMode } = useColorMode();
  const value = useContext(AppContext);
  const [pending, setPending] = useState(false);
  const [rpsAddress, setRpsAddress] = useState(ropstenAddress);

  const gameStatus = () => {
    switch (value.state.status) {
      case 0:
        return "Waiting for your commitment...";
      case 0.1:
        return "Sending commitment...";
      case 1:
        return "Waiting for opponent's commitment...";
      case 2:
        return "Waiting for your verification...";
      case 2.1:
        return "Sending verification...";
      case 2.2:
        return "Waiting for opponent's verification...";
      case 2.3:
        return "Sending cancellation...";
      case 3:
        return "Game finished! GG!";
      case 4:
        return "Game cancelled!";
    }
  };

  const getRequireError = (err) => {
    if (err.code === 4001) {
      return;
    }
    if (rpsAddress === arbitrumAddress && err.data.message) {
      return err.data.message.replace("execution reverted:", "");
    }

    const regex = /"message":"execution reverted: (.*?)"/;
    const match = regex.exec(err);
    if (match) {
      return match[1];
    }
  };

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
    const commitment = encrypt(nonce, value.state.choice);
    if (typeof window.ethereum !== "undefined") {
      try {
        await requestAccount();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
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
        value.setStatus(0.1);
        setPending(true);
        await transaction.wait();
        setPending(false);
        // Ensure that we aren't backtracking the game status
        if (value.state.status <= 0.1) {
          value.setStatus(1);
        }
        toast({
          title: "Commitment Received!",
          description: "Your choice has been encrypted.",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      } catch (err) {
        value.setStatus(0);
        toast({
          title: "Commitment Failed!",
          description: getRequireError(err),
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
          ethers.BigNumber.from(nonce)
        );
        value.setStatus(2.1);
        setPending(true);
        await transaction.wait();
        setPending(false);
        // Ensure that we aren't backtracking the game status
        if (value.state.status <= 2.1) {
          value.setStatus(2.2);
        }

        toast({
          title: "Verification Confirmed!",
          description: "Your choice has been verified.",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      } catch (err) {
        toast({
          title: "Verification Failed!",
          description: getRequireError(err),
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
        const transaction = await contract.requestRefund(
          value.state.bytesGameId
        );
        value.setStatus(2.3);
        setPending(true);
        await transaction.wait();
        setPending(false);
      } catch (err) {
        console.error(err);
        toast({
          title: "Cancellation Failed!",
          description: getRequireError(err),
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
        const requestMoveFilter = {
          address: rpsAddress,
          topics: [ethers.utils.id("requestMoves(bytes32)")],
        };
        const winnerFilter = {
          address: rpsAddress,
          topics: [ethers.utils.id("winner(bytes32,address)")],
        };
        const cancelFilter = {
          address: rpsAddress,
          topics: [ethers.utils.id("gameCancel(bytes32)")],
        };
        contract.on(requestMoveFilter, (gameId) => {
          if (gameId !== value.state.bytesGameId || value.state.status >= 2) {
            return;
          }
          value.setStatus(2);
          toast({
            title: "Opponent Committed!",
            description: "Please verify your choice",
            status: "info",
            duration: 5000,
            isClosable: true,
            position: "top-right",
          });
        });
        contract.on(winnerFilter, async (gameId, winnerAddress) => {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          if (gameId !== value.state.bytesGameId || value.state.status >= 3) {
            return;
          }
          value.setStatus(3);
          if (winnerAddress === "0x0000000000000000000000000000000000000000") {
            value.setOutcome("tie");
          } else if (winnerAddress === address) {
            value.setOutcome("win");
          } else {
            value.setOutcome("loss");
          }
        });

        contract.on(cancelFilter, (gameId) => {
          if (gameId !== value.state.bytesGameId || value.state.status >= 4) {
            return;
          }
          value.setStatus(4);
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
        <Select
          mt={"1rem"}
          variant="filled"
          boxShadow="md"
          onChange={(e) => setRpsAddress(e.target.value)}
        >
          <option value={ropstenAddress}>Ropsten (L1)</option>
          <option value={arbitrumAddress}>Arbitrum Rinkeby (L2)</option>
          <option value="kovan" disabled>
            Optimism Kovan (L2)
          </option>
          <option value={polygonAddress} disabled>
            Polygon Mumbai (L2)
          </option>
        </Select>

        <Box
          boxShadow={colorMode === "light" ? "lg" : "dark-lg"}
          maxW="md"
          borderRadius="lg"
          overflow="hidden"
          m={3}
        >
          <Box p={4}>
            <Grid
              templateRows="repeat(4, 1fr)"
              templateColumns="repeat(6, 1fr)"
              rowGap={0.5}
              columnGap={4}
              overflow={"visible"}
            >
              <GridItem rowSpan={1} colSpan={1}>
                <Text mt={1} fontWeight="bold">
                  Username
                </Text>{" "}
              </GridItem>
              <GridItem rowSpan={1} colSpan={5}>
                <Input
                  disabled={value.state.status !== 0}
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
              {/* <GridItem rowSpan={1} colSpan={1}>
                <Text mt={1} fontWeight="bold">
                  Status
                </Text>
              </GridItem>
              <GridItem rowSpan={1} colSpan={5}>
                <HStack mt={value.state.status >= 3 ? 0 : 1} spacing={3}>
                  {value.state.outcome === "unknown" &&
                    value.state.status !== 4 && (
                      <Spinner size="md" speed="0.9s" />
                    )}
                  <Text mt={1}>{gameStatus()}</Text>
                </HStack>
              </GridItem> */}
              <GridItem rowSpan={1} colSpan={1}>
                <Text mt={1} fontWeight="bold">
                  Status
                </Text>
              </GridItem>
              <GridItem rowSpan={1} colSpan={5}>
                <Status pending={pending} />
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
