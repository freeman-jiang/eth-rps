import { Heading, HStack } from "@chakra-ui/layout";
import { Icon } from "@iconify/react";

export const Header = () => {
  return (
    <HStack spacing={0} mt={5} ml={5}>
      <Icon icon="mdi:ethereum" fontSize={32} />
      <Heading size="lg">EthRPS</Heading>
    </HStack>
  );
};
