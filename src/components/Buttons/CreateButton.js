import React, { useContext, useState } from "react";
import { Button, IconButton } from "@chakra-ui/button";
import { Grid, GridItem, Heading, HStack, Text } from "@chakra-ui/layout";
import { useDisclosure } from "@chakra-ui/hooks";
import {
  useClipboard,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { CopyIcon } from "@chakra-ui/icons";
import { Input } from "@chakra-ui/input";
import { RoundedArrow } from "./RoundedArrow";
import { RoundedButton } from "./RoundedButton";
import AppContext from "../../utils/AppContext";
import { nanoid } from "nanoid";
import { ethers } from "ethers";

export const CreateButton = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const value = useContext(AppContext);
  const { hasCopied, onCopy } = useClipboard(value.state.gameId);
  const reset = () => {
    const newId = nanoid();
    value.setGameId(newId);
    value.setBytesGameId(ethers.utils.id(newId));
    value.setStatus(0);
    value.setOutcome("unknown");
    value.setBet(0);
    value.setChoice(1);
  };
  return (
    <>
      <RoundedArrow
        color="green"
        content="Create Game"
        onClick={() => {
          reset();
          onOpen();
        }}
        size="lg"
      />

      <Modal size="lg" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent top="6rem">
          <ModalHeader>Create a game</ModalHeader>
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
                <HStack>
                  <Input
                    isReadOnly
                    value={value.state.gameId}
                    variant="filled"
                  />
                  <IconButton
                    aria-label="Copy game ID"
                    onClick={() => {
                      toast({
                        title: "Game ID Copied!",
                        description: "Send this ID to your opponent.",
                        status: "info",
                        duration: 3000,
                        isClosable: true,
                        position: "top-right",
                      });
                      onCopy();
                    }}
                    icon={<CopyIcon />}
                  />
                </HStack>
              </GridItem>
            </Grid>
          </ModalBody>

          <ModalFooter>
            <RoundedButton
              nextLink="/play"
              color="green"
              content="Start Game"
              onClick={() => {
                onClose();
                toast({
                  title: "Game Created!",
                  description: "May the odds be ever in your favour.",
                  status: "success",
                  duration: 4000,
                  isClosable: true,
                  position: "top-right",
                });
              }}
              size="md"
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
