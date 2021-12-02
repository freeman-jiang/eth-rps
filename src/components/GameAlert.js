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
  const [showAlert, setShowAlert] = useState(true);
  if (showAlert) {
    return (
      <Alert rounded="lg" status="success">
        <AlertIcon />
        <AlertTitle mr={2}>Congratulations!</AlertTitle>
        <AlertDescription>You won 2 ETH</AlertDescription>
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
  } else {
    return null;
  }
};
