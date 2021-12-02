import { Button } from "@chakra-ui/button";
import React from "react";

export const RoundedButton = ({ content, color, onClick, size }) => {
  return (
    <Button
      onClick={onClick}
      colorScheme={color}
      bg={`${color}.400`}
      size={size}
      boxShadow="xl"
      rounded={"full"}
      mb={1}
      _hover={{
        bg: `${color}.500`,
      }}
    >
      {content}
    </Button>
  );
};
