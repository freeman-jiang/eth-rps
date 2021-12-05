import { Button } from "@chakra-ui/button";
import React, { useContext } from "react";
import AppContext from "../../utils/AppContext";

export const CommitmentButton = ({ sendCommitment }) => {
  const value = useContext(AppContext);
  return (
    <Button
      onClick={sendCommitment}
      colorScheme="blue"
      // disabled={
      //   value.state.choice === 0 ||
      //   value.state.status !== 0
      // }
    >
      Submit
    </Button>
  );
};
