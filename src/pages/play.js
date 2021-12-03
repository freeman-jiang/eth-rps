import { useState, useContext } from "react";
import AppContext from "../utils/AppContext";
import { ethers, logger } from "ethers";
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
import { useToast } from "@chakra-ui/react";
import { ControlPanel } from "../components/ControlPanel";

// const rpsAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const rpsAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const salt = ethers.utils.randomBytes(32);
const encrypt = (salt, choice) => {
  const commitment = ethers.utils.solidityKeccak256(
    ["uint", "uint8"],
    [ethers.BigNumber.from(salt), choice]
  );
  return commitment;
};

const Play = () => {
  const value = useContext(AppContext);
  const toast = useToast();
  const [choice, setChoice] = useState(0);

  const requestAccount = async () => {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  };

  const sendCommitment = async () => {
    const commitment = encrypt(salt, choice);
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
          choice,
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
    <>
      <NavBar />
      <br />
      <Center>
        <Heading>Pick Wisely.</Heading>
      </Center>
      <ControlPanel />
    </>
  );
};

export default Play;
