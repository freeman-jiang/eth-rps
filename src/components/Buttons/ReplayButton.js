import { Button } from "@chakra-ui/button";
import React, { useContext } from "react";
import AppContext from "../../utils/AppContext";
import { nanoid } from "nanoid";
import { ethers } from "ethers";

export const ReplayButton = () => {
  const value = useContext(AppContext);
  const reset = () => {
    const newId = nanoid();
    value.setGameId(newId);
    value.setBytesGameId(ethers.utils.id(newId));
    value.setStatus("Waiting for your commitment...");
    value.setOutcome("unknown");
    value.setBet(0);
    value.setChoice(0);
    value.setDisableCancel(false);
  };
  return (
    <Button
      colorScheme="teal"
      onClick={reset}
      disabled={
        value.state.status === "Waiting for your commitment..." ||
        value.state.status === "Waiting for opponent's commitment..." ||
        value.state.status === "Cancellation in progress..." ||
        value.state.status === "Waiting for your verification..." ||
        value.state.status === "Waiting for opponent's verification..."
      }
    >
      Replay
    </Button>
  );
};
