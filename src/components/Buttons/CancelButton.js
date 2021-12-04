import { Button } from "@chakra-ui/button";
import React, { useContext } from "react";
import AppContext from "../../utils/AppContext";

export const CancelButton = ({ cancel }) => {
  const value = useContext(AppContext);
  return (
    <Button
      disabled={
        value.state.status === "Cancellation in progress..." ||
        value.state.status === "Game finished! GG!" ||
        value.state.status === "Waiting for your commitment..." ||
        value.state.status === "Game cancelled!"
      }
      onClick={() => {
        cancel();
      }}
      colorScheme="red"
    >
      Cancel
    </Button>
  );
};
