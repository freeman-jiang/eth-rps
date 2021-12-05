import { ListItem, Text } from "@chakra-ui/layout";
import React from "react";

export const Step = ({ content }) => {
  return (
    <ListItem>
      <Text fontSize="xl">{content}</Text>
    </ListItem>
  );
};
