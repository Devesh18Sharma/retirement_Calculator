// src/theme.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "Libre Franklin, Arial, sans-serif",
    fontWeightRegular: 500,
  },
  palette: {
    primary: { main: "#2c3c64" },
    secondary: { main: "#000000" },
    // Using MUI's built-in grey instead of custom (or extend via module augmentation if needed)
    grey: { main: "#949EAB" },
  },
});

export default theme;
