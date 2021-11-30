import { ChakraProvider } from "@chakra-ui/react";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";

export default function Home() {
  return (
    <ChakraProvider>
      <Header />
      <Hero />
    </ChakraProvider>
  );
}
