import React, { useState } from "react";
import AppContext from "../utils/AppContext";
import { ChakraProvider } from "@chakra-ui/provider";
import { extendTheme } from "@chakra-ui/react";
import { nanoid } from "nanoid";
import { ethers } from "ethers";

const App = ({ Component, pageProps }) => {
  const [username, setUsername] = useState("");
  const [gameId, setGameId] = useState(nanoid());
  const [bytesGameId, setBytesGameId] = useState(ethers.utils.id(gameId));
  const [status, setStatus] = useState("Waiting for your commitment...");
  const [outcome, setOutcome] = useState("unknown");
  const [bet, setBet] = useState(0);
  const [choice, setChoice] = useState(0);
  const Alert = {
    baseStyle: {
      container: {
        my: "8px",
      },
    },
  };
  const theme = extendTheme({
    components: {
      Alert,
    },
    fonts: {},
  });

  return (
    <ChakraProvider theme={theme}>
      <AppContext.Provider
        value={{
          state: {
            username,
            gameId,
            bytesGameId,
            status,
            outcome,
            bet,
            choice,
          },
          setUsername,
          setGameId,
          setBytesGameId,
          setStatus,
          setOutcome,
          setBet,
          setChoice,
        }}
      >
        <Component {...pageProps} />
      </AppContext.Provider>
    </ChakraProvider>
  );
};

export default App;
