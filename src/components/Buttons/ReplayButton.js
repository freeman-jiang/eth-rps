import { Button } from "@chakra-ui/button";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import AppContext from "../../utils/AppContext";
import { nanoid } from "nanoid";
import { ethers } from "ethers";
import { Text } from "@chakra-ui/layout";

export const ReplayButton = () => {
  const value = useContext(AppContext);
  const [isOpen, setIsOpen] = React.useState(false);
  const onClose = () => setIsOpen(false);
  const cancelRef = React.useRef();
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
      <Button colorScheme="teal" onClick={() => setIsOpen(true)}>
        Replay
      </Button>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent top="6rem">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Play Another Game
            </AlertDialogHeader>

            <AlertDialogBody>
              <Text>
                Are you sure?{" "}
                <Text as="span" color="tomato" fontWeight="bold">
                  Your bets will NOT be refunded if you didn{"'"}t cancel the
                  game.
                </Text>{" "}
                If you begin another game, this game will be lost forever.
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                colorScheme="red"
                onClick={() => {
                  reset();
                  onClose();
                }}
                mr={3}
              >
                Confirm
              </Button>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
