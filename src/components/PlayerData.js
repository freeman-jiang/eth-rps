import { Box, Heading, HStack, Text, VStack, Divider } from "@chakra-ui/layout";
import { Code } from "@chakra-ui/react";

export const PlayerData = ({ gameDetails, player, score }) => {
  const [wins, losses] = score;
  const emptyBytes =
    "0x0000000000000000000000000000000000000000000000000000000000000000";
  const emptyAddress = "0x0000000000000000000000000000000000000000";
  console.log("player game details", gameDetails);
  const getChoice = (num) => {
    switch (num) {
      case 0:
        return "Unknown";
      case 1:
        return "Rock";
      case 2:
        return "Paper";
      case 3:
        return "Scissors";
    }
  };

  if (score.length !== 0) {
    return (
      <Box p={2} rounded="lg" mt={3}>
        <HStack>
          <Text fontWeight="bold">Player:</Text>
          <Code>{player}</Code>
        </HStack>
        <HStack>
          <Text fontWeight="bold">Wins:</Text>
          <Text>{wins}</Text>
        </HStack>
        <HStack>
          <Text fontWeight="bold">Losses:</Text>
          <Text>{losses}</Text>
        </HStack>
      </Box>
    );
  }
  if (!gameDetails) {
    return null;
  }
  if (gameDetails.player1 !== emptyAddress) {
    return (
      <Box p={2} rounded="lg" borderColor="gray.200" mt={3}>
        <Heading size="md">Player 1</Heading>
        <HStack mt={2}>
          <Text fontWeight="bold">Address:</Text>
          <Code>{gameDetails.player1}</Code>
        </HStack>
        <HStack>
          <Text fontWeight="bold">Username:</Text>
          <Code>{gameDetails.player1Name}</Code>
        </HStack>
        <HStack>
          <Text fontWeight="bold">Committed?:</Text>
          <Code>{gameDetails.p1Commit === emptyBytes ? "No" : "Yes"}</Code>
        </HStack>
        <HStack>
          <Text fontWeight="bold">Choice:</Text>
          <Code>{getChoice(gameDetails.p1Choice)}</Code>
        </HStack>

        {gameDetails.player2 !== emptyAddress && (
          <Box>
            <Divider my={2} />
            <Heading size="md">Player 2</Heading>
            <HStack mt={2}>
              <Text fontWeight="bold">Address:</Text>
              <Code>{gameDetails.player2}</Code>
            </HStack>
            <HStack>
              <Text fontWeight="bold">Username:</Text>
              <Code>{gameDetails.player2Name}</Code>
            </HStack>
            <HStack>
              <Text fontWeight="bold">Committed?:</Text>
              <Code>{gameDetails.p2Commit === emptyBytes ? "No" : "Yes"}</Code>
            </HStack>
            <HStack>
              <Text fontWeight="bold">Choice:</Text>
              <Code>{getChoice(gameDetails.p2Choice)}</Code>
            </HStack>
            {gameDetails.winner !== emptyAddress && (
              <>
                <Divider my={2} />
                <Heading size="md">Winner</Heading>
                <HStack mt={2}>
                  <Text fontWeight="bold">Address:</Text>
                  <Code>{gameDetails.winner}</Code>
                </HStack>
              </>
            )}
          </Box>
        )}
      </Box>
    );
  }
};
