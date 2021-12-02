import React, { useContext, useState } from "react";
import { Button, IconButton } from "@chakra-ui/button";
import { Grid, GridItem, Heading, HStack, Text } from "@chakra-ui/layout";
import { useDisclosure } from "@chakra-ui/hooks";
import { useClipboard } from "@chakra-ui/react";
import NextLink from "next/link";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";
import { Input } from "@chakra-ui/input";
import { RoundedArrow } from "./RoundedArrow";
import { RoundedButton } from "./RoundedButton";
import AppContext from "../../utils/AppContext";

export const CreateButton = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const value = useContext(AppContext);
  const { hasCopied, onCopy } = useClipboard(value.state.gameId);
  return (
    <>
      <RoundedArrow
        color="green"
        content="Create Game"
        onClick={() => {
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
              onClick={onClose}
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
