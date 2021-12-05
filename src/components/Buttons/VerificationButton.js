import { Button } from "@chakra-ui/button";
import React, { useContext } from "react";
import AppContext from "../../utils/AppContext";

export const VerificationButton = ({ sendVerification }) => {
  const value = useContext(AppContext);
  return (
    <Button
      onClick={sendVerification}
      colorScheme="teal"
      // disabled={
      //   value.state.status !== 2 ||
      //   value.state.status === 2.1
      // }
    >
      Verify
    </Button>
  );
};
