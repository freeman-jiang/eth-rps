import { ChakraProvider } from "@chakra-ui/provider";
import { Header } from "../components/Header";

const about = () => {
  return (
    <ChakraProvider>
      <Header />
    </ChakraProvider>
  );
};

export default about;
