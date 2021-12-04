import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { Button, IconButton } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Search2Icon } from "@chakra-ui/icons";
import { Icon } from "@chakra-ui/icon";
import { Input } from "@chakra-ui/input";
import { PlayerData } from "./PlayerData";

export const Search = ({
  sendSearch,
  query,
  setQuery,
  player,
  score,
  gameDetails,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <IconButton
        size="md"
        colorScheme="purple"
        icon={<Icon as={Search2Icon} w={4} h={4} />}
        onClick={onOpen}
      >
        Open Modal
      </IconButton>

      <Modal size="lg" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent top="6rem">
          <ModalHeader>Search The Blockchain</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Enter a Game ID or Ethereum address"
              variant="filled"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <PlayerData
              player={player}
              score={score}
              gameDetails={gameDetails}
            />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={sendSearch}>
              Search
            </Button>
            <Button onClick={onClose} variant="ghost">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
