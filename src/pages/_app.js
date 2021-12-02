import React, { useState } from "react";
import AppContext from "../utils/AppContext";
import { ChakraProvider } from "@chakra-ui/provider";
import { extendTheme } from "@chakra-ui/react";
import { nanoid } from "nanoid";

const App = ({ Component, pageProps }) => {
  const theme = extendTheme({
    fonts: {},
  });
  const [username, setUsername] = useState("");
  const [gameId, setGameId] = useState(nanoid());

  return (
    <ChakraProvider theme={theme}>
      <AppContext.Provider
        value={{
          state: {
            username,
            gameId,
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
