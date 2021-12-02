import { Button } from "@chakra-ui/button";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import React from "react";

export const RoundedArrow = ({ content, color, onClick, size, nextLink }) => {
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
      {content} <ArrowForwardIcon ml={2} />
    </Button>
  );
};
