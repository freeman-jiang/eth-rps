import NavBar from "../components/NavBar";
import { Center, Heading } from "@chakra-ui/layout";
import { ControlPanel } from "../components/ControlPanel";

const Play = () => {
  return (
    <>
      <br />
      <Center>
        <Heading>Choose Wisely.</Heading>
      </Center>
      <ControlPanel />
    </>
  );
};

export default Play;
