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

// Helper to format numbers with commas for display
const formatNumber = (val: number) =>
  val.toLocaleString("en-US", { maximumFractionDigits: 0 });

const CustomGraphTooltip: React.FC<TooltipProps> = ({
  active,
  label,
  payload,
  chartData,
}) => {
  if (!active || !label || !payload) return null;
  
  // Convert label to number (year)
  const year = Number(label);
  
  // Get data for this year - either from chart data or calculate it
  let dataItem: ChartItem | undefined;
  
  // First try to find exact match in chart data
  dataItem = chartData.find((d) => d.year === year);
  
  // If no exact match and it's after retirement age, we need to calculate values
  if (!dataItem) {
    // Find the last item in the chart data (retirement point)
    const retirementPoint = chartData[chartData.length - 1];
    
    if (retirementPoint && year > retirementPoint.year) {
      // Calculate how many years past retirement
      const yearsPastRetirement = year - retirementPoint.year;
      
      // Calculate decay factor - same as in chart
      const factor = Math.pow(yearsPastRetirement / (95 - retirementPoint.year), 1.5);
      
      // Calculate decayed values
      const userVal = Math.floor(retirementPoint.userPortion * (1 - factor * 0.8));
      const swipeVal = Math.floor(retirementPoint.swipePortion * (1 - factor * 0.8));
      
      // Create a synthetic data item
      dataItem = {
        year,
        userPortion: Math.max(0, userVal),
        swipePortion: Math.max(0, swipeVal),
        whatWeWant: retirementPoint.whatWeWant, // Goal stays constant
      };
    }
  }
  
  // If we still don't have data, return null
  if (!dataItem) return null;

  const whatWeHave = dataItem.userPortion + dataItem.swipePortion;

  return (
    <Container
      sx={{
        backgroundColor: "#ffffff",
        padding: "10px",
        borderRadius: "10px",
        boxShadow: 3,
        minWidth: "220px",
      }}
    >
      <Box sx={{ paddingBottom: "5px" }}>
        <Typography variant="h6">Age: {year}</Typography>
      </Box>
      <Typography variant="body2" sx={{ color: "#82ca9d", mb: 0.5 }}>
        Your Savings: ${formatNumber(dataItem.userPortion)}
      </Typography>
      <Typography variant="body2" sx={{ color: "#ff9933", mb: 0.5 }}>
        SwipeSwipe: ${formatNumber(dataItem.swipePortion)}
      </Typography>
      <Typography variant="body2" sx={{ color: "#333333", fontWeight: "bold", mb: 0.5 }}>
        Total: ${formatNumber(whatWeHave)}
      </Typography>
      <Typography variant="body2" sx={{ color: "#8884d8", mb: 0.5 }}>
        Goal: ${formatNumber(dataItem.whatWeWant)}
      </Typography>
      {whatWeHave >= dataItem.whatWeWant ? (
        <Typography variant="body2" sx={{ color: "green", fontWeight: "bold" }}>
          On track! 👍
        </Typography>
      ) : (
        <Typography variant="body2" sx={{ color: "red", fontWeight: "bold" }}>
          Gap: ${formatNumber(dataItem.whatWeWant - whatWeHave)}
        </Typography>
      )}
    </Container>
  );
};

export default CustomGraphTooltip;
