import {
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
      <Heading>About</Heading>
      <Text>EthRPS is a </Text>
    </VStack>
  );
};

export default about;
