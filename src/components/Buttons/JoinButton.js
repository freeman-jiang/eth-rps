import React from "react";
import { Button, IconButton } from "@chakra-ui/button";
import { Grid, GridItem, Heading, HStack, Text } from "@chakra-ui/layout";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";

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
import { RoundedArrow } from "./RoundedArrow";
import { RoundedButton } from "./RoundedButton";
import { EditIcon } from "@chakra-ui/icons";

export const JoinButton = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
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
              templateRows="repeat(1, 1fr)"
              templateColumns="repeat(12, 1fr)"
              gap={4}
            >
              <GridItem rowSpan={1} colSpan={3}>
                <Text mt={1} fontSize="lg">
                  Game ID:
                </Text>
              </GridItem>
              <GridItem rowSpan={1} colSpan={9}>
                <HStack>
                  <Input
                    placeholder={"Paste your game ID here"}
                    variant="filled"
                  />
                  {/* <IconButton
                    // colorScheme="green"
                    aria-label="Copy game ID"
                    onClick={() => {
                      
                    }}
                    icon={<EditIcon />}
                  /> */}
                </HStack>
              </GridItem>
            </Grid>
          </ModalBody>

          <ModalFooter>
            <RoundedButton
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
