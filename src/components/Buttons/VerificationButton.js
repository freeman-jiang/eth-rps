import { Button } from "@chakra-ui/button";
import React, { useContext } from "react";
import AppContext from "../../utils/AppContext";

export const VerificationButton = ({ sendVerification }) => {
  const value = useContext(AppContext);
  return (
    <Button
      onClick={sendVerification}
      colorScheme="teal"
      disabled={
        value.state.status !== "Waiting for your verification..." ||
        value.state.status === "Sending verification..."
      }
    >
      Verify
    </Button>
  );
};
