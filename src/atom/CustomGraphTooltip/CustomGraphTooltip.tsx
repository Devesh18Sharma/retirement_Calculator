import React from "react";
import { Box, Container, Typography } from "@mui/material";

interface ChartItem {
  year: number;
  userPortion: number;
  swipePortion: number;
  whatWeWant: number;
}

interface TooltipProps {
  active?: boolean;
  label?: number | string;
  payload?: any[];
  chartData: ChartItem[];
}

const CustomGraphTooltip: React.FC<TooltipProps> = ({
  active,
  label,
  payload,
  chartData,
}) => {
  if (!active || !label || !payload) return null;
  const year = Number(label);
  const dataItem = chartData.find((d) => d.year === year);
  if (!dataItem) return null;

  const whatWeHave = dataItem.userPortion + dataItem.swipePortion;

  return (
    <Container
      sx={{
        backgroundColor: "#ffffff",
        padding: "10px",
        borderRadius: "10px",
        boxShadow: 3,
        minWidth: "200px",
      }}
    >
      <Box sx={{ paddingBottom: "5px" }}>
        <Typography variant="h6">Year: {label}</Typography>
      </Box>
      <Typography variant="body2" sx={{ color: "#82ca9d" }}>
        What We Have: ${whatWeHave.toLocaleString("en-US")}
      </Typography>
      <Typography variant="body2" sx={{ color: "#FBC950" }}>
        SwipeSwipe: ${dataItem.swipePortion.toLocaleString("en-US")}
      </Typography>
      <Typography variant="body2" sx={{ color: "#8884d8" }}>
        What We Want: ${dataItem.whatWeWant.toLocaleString("en-US")}
      </Typography>
    </Container>
  );
};

export default CustomGraphTooltip;
