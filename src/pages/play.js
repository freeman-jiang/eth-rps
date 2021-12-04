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

const Play = () => {
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
