import { useContext } from "react";
import AppContext from "../utils/AppContext";
import { Button, IconButton } from "@chakra-ui/button";
import Icon from "@chakra-ui/icon";
import { CopyIcon } from "@chakra-ui/icons";
import { Input } from "@chakra-ui/input";
import {
  Center,
  Container,
  Heading,
  HStack,
  Stack,
  VStack,
  Text,
  Box,
  GridItem,
  Grid,
} from "@chakra-ui/layout";
import React from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "@chakra-ui/alert";
import { CloseButton } from "@chakra-ui/close-button";
import { GameAlert } from "./GameAlert";

export const GameStatus = () => {
  const value = useContext(AppContext);
  return (
    <Center>
      <VStack>
        <GameAlert />
        <Box boxShadow="lg" maxW="md" borderRadius="lg" overflow="hidden" m={3}>
          <Box p={4}>
            <Grid
              templateRows="repeat(3, 1fr)"
              templateColumns="repeat(6, 1fr)"
              rowGap={2}
              columnGap={3}
            >
              <GridItem rowSpan={1} colSpan={1}>
                <Text mt={1} fontWeight="bold">
                  Username:
                </Text>{" "}
              </GridItem>
              <GridItem rowSpan={1} colSpan={5}>
                <Input
                  rounded="lg"
                  size="sm"
                  value={value.state.username}
                  placeholder="New Player"
                  variant="filled"
                  onChange={(e) => value.setUsername(e.target.value)}
                />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <Text mt={1} fontWeight="bold">
                  Game ID:
                </Text>
              </GridItem>
              <GridItem rowSpan={1} colSpan={5}>
                <HStack>
                  <Input
                    rounded="lg"
                    size="sm"
                    isReadOnly
                    value={value.state.gameId}
                    variant="filled"
                  />
                  <IconButton
                    size="sm"
                    aria-label="Copy game ID"
                    onClick={() => {
                      onCopy();
                    }}
                    icon={<CopyIcon />}
                  />
                </HStack>
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <Text mt={1} fontWeight="bold">
                  Status:
                </Text>
              </GridItem>
              <GridItem rowSpan={1} colSpan={5}>
                <Text mt={1}>{value.state.status}</Text>
              </GridItem>
            </Grid>
          </Box>
        </Box>
      </VStack>
    </Center>
  );
};
