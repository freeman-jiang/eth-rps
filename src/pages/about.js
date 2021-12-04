import {
  Box,
  Center,
  Container,
  Heading,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/layout";
import NavBar from "../components/NavBar";

const about = () => {
  return (
    <VStack mt={5}>
      <Box maxW="2xl">
        <Heading>About</Heading>
        <Text color="gray.600" mt={3}>
          EthRPS is a simple, decentralized, and transparent rock paper scissors
          game that runs on the Ethereum blockchain. Players are . Created over
          the
        </Text>
      </Box>
    </VStack>
  );
};

export default about;
