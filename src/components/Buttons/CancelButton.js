import { Button } from "@chakra-ui/button";
import React, { useContext } from "react";
import AppContext from "../../utils/AppContext";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { Text } from "@chakra-ui/layout";

export const CancelButton = ({ cancel }) => {
  const value = useContext(AppContext);
  const [isOpen, setIsOpen] = React.useState(false);
  const onClose = () => setIsOpen(false);
  const cancelRef = React.useRef();
  return (
    <div>
      <Button
        // disabled={
        //   value.state.status === 2.3 ||
        //   value.state.status === 3 ||
        //   value.state.status === 4 ||
        //   value.state.status <= 0.1
        // }
        onClick={() => {
          setIsOpen(true);
        }}
        colorScheme="red"
      >
        Cancel
      </Button>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent top="6rem">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Cancel This Game
            </AlertDialogHeader>

            <AlertDialogBody>
              <Text>
                Are you sure? Both players will be refunded their bets, but{" "}
                <Text as="span" color="tomato" fontWeight="bold">
                  this game will be lost forever.
                </Text>{" "}
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                colorScheme="red"
                onClick={() => {
                  cancel();
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
    </div>
  );
};
