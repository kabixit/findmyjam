// src/theme.js
import { extendTheme } from "@chakra-ui/react";
const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "black",
        color: "white",
        fontFamily: "'Manrope', sans-serif",
      },
    },
  },
});

export default theme;
