// src/App.tsx
import React from "react";
import "./App.css";
import RetirementCalculator from "./organisms/RetirementCalculator/RetirementCalculator";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RetirementCalculator />
    </ThemeProvider>
  );
};

export default App;
