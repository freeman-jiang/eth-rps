import React, { useState } from "react";
import AppContext from "../utils/AppContext";
import { ChakraProvider } from "@chakra-ui/provider";
import { extendTheme } from "@chakra-ui/react";
import { nanoid } from "nanoid";

const App = ({ Component, pageProps }) => {
  const [username, setUsername] = useState("");
  const [gameId, setGameId] = useState(nanoid());
  const [status, setStatus] = useState("Not Started");
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
            status,
          },
          setUsername,
          setGameId,
        }}
      >
        <Component {...pageProps} />
      </AppContext.Provider>
    </ChakraProvider>
  );
};

export default App;
