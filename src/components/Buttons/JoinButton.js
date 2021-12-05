import React, { useContext } from "react";
import AppContext from "../../utils/AppContext";
import { Button } from "@chakra-ui/button";
import { Grid, GridItem, Text } from "@chakra-ui/layout";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
} from "@chakra-ui/react";
import { RoundedArrow } from "./RoundedArrow";
import { RoundedButton } from "./RoundedButton";
import { ethers } from "ethers";

export const JoinButton = () => {
  const toast = useToast();
  const value = useContext(AppContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const reset = () => {
    value.setStatus(0);
    value.setOutcome("unknown");
    value.setBet(0);
    value.setChoice(1);
  };
  return (
    <>
      <RoundedArrow
        color="blue"
        content="Join Game"
        onClick={() => {
          onOpen();
        }}
        size="lg"
      />

      <Modal size="lg" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent top="6rem">
          <ModalHeader>Join a game</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid
              templateRows="repeat(2, 1fr)"
              templateColumns="repeat(6, 1fr)"
              gap={4}
            >
              <GridItem rowSpan={1} colSpan={1}>
                <Text mt={1} fontSize="lg">
                  Username:
                </Text>{" "}
              </GridItem>
              <GridItem rowSpan={1} colSpan={5}>
                <Input
                  value={value.state.username}
                  placeholder="Vitalik Buterin"
                  variant="outline"
                  onChange={(e) => value.setUsername(e.target.value)}
                />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <Text mt={1} fontSize="lg">
                  Game ID:
                </Text>
              </GridItem>
              <GridItem rowSpan={1} colSpan={5}>
                <Input
                  variant="outline"
                  onChange={(e) => {
                    value.setGameId(e.target.value);
                    value.setBytesGameId(ethers.utils.id(e.target.value));
                  }}
                />
              </GridItem>
            </Grid>
          </ModalBody>

          <ModalFooter>
            <RoundedButton
              color="blue"
              content="Join Game"
              onClick={() => {
                reset();
                onClose();
                toast({
                  title: "Game Joined!",
                  description: "May the odds be ever in your favour.",
                  status: "info",
                  duration: 4000,
                  isClosable: true,
                  position: "top-right",
                });
              }}
              size="md"
              nextLink="/play"
            />

            <Button onClick={onClose} rounded="full" ml="3" variant="ghost">
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
