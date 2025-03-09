// src/App.tsx
import React from "react";
import RetirementCalculator from "./organisms/RetirementCalculator/RetirementCalculator";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <RetirementCalculator />
    </ThemeProvider>
  );
};

export default App;
