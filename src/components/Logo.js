import { Heading, HStack } from "@chakra-ui/layout";
import { Icon } from "@iconify/react";

export const Logo = () => {
  return (
    <HStack spacing={0} pr={2.5}>
      <Icon icon="mdi:ethereum" fontSize={32} />
      <Heading size="lg">EthRPS</Heading>
    </HStack>
  );
};
