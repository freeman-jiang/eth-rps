import { ChakraProvider } from "@chakra-ui/provider";
import { Header } from "../components/Header";

const play = () => {
  return (
    <ChakraProvider>
      <Header />
    </ChakraProvider>
  );
};

export default play;
