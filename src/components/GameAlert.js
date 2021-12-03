import { useContext, useState } from "react";
import AppContext from "../utils/AppContext";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "@chakra-ui/alert";
import { CloseButton } from "@chakra-ui/close-button";

export const GameAlert = () => {
  const value = useContext(AppContext);
  if (value.state.outcome === "unknown") {
    return null;
  }
  if (value.state.outcome === "tie") {
    return (
      <Alert rounded="lg" status="warning">
        <AlertIcon />
        <AlertTitle mr={2}>{"It's a tie!"}</AlertTitle>
        <AlertDescription>Your bets have been returned.</AlertDescription>
        <CloseButton
          onClick={() => {
            setShowAlert(false);
          }}
          position="absolute"
          right="8px"
          top="8px"
        />
      </Alert>
    );
  }
  return (
    <Alert
      rounded="lg"
      status={value.state.outcome === "win" ? "success" : "error"}
    >
      <AlertIcon />
      <AlertTitle mr={2}>
        {value.state.outcome === "win" ? "Congratulations!" : "Oh no!"}
      </AlertTitle>
      <AlertDescription>
        {value.state.outcome === "win"
          ? `You won ${2 * value.state.bet} ETH!`
          : `You lost ${value.state.bet} ETH!`}
      </AlertDescription>
      <CloseButton
        onClick={() => {
          setShowAlert(false);
        }}
        position="absolute"
        right="8px"
        top="8px"
      />
    </Alert>
  );
};
