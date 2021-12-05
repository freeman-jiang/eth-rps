import { CheckIcon } from "@chakra-ui/icons";
import { HStack, Text } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import React, { useState } from "react";
let firstTime = true;

export const Status = ({ pending }) => {
  if (pending) {
    firstTime = false;
    return (
      <HStack mt={1}>
        <Spinner size="md" speed="0.9s" />
        <Text>Processing transaction...</Text>
      </HStack>
    );
  }
  return (
    <HStack mt={1}>
      <CheckIcon size="md" />
      <Text>No pending transactions</Text>
    </HStack>
  );
};
