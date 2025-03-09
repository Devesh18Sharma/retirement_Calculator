import React, { useState, useMemo } from "react";
import "./RetirementCalc.css";
import {
  Box,
  Container,
  Grid,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Card,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Recharts + custom tooltip
import RetirementChart from "./RetirementChart";
import CustomGraphTooltip from "../../atom/CustomGraphTooltip/CustomGraphTooltip";

// Calculation helpers
import {
  futureValueMonthlyCompounding,
  calcRetirementRunoutAge,
  findTargetMonthlyContribution,
} from "../../utils/calculations";

import { NumericFormat, NumericFormatProps } from "react-number-format";
import TextField from "@mui/material/TextField";

//
// 1. STYLED COMPONENTS
//

// Main heading centered
const MainHeading = styled(Typography)(({ theme }) => ({
  fontFamily: "Caudex, Arial, sans-serif",
  fontWeight: 700,
  color: "#293a60",
  textAlign: "center",
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

// A container that ensures Graph & Summary have the same height
const ChartOrSummaryContainer = styled("div")(() => ({
  minHeight: 480, // Enough space to match the chart ~400 + padding, so toggling doesn't resize
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

// Helper to format large numbers with commas
const formatNumber = (val: number) =>
  val.toLocaleString("en-US", { maximumFractionDigits: 0 });

//
// 2. MAIN COMPONENT
//
const RetirementCalculator: React.FC = () => {
  // A. State: input fields
  const [currentAge, setCurrentAge] = useState<number>(35);
  const [desiredRetirementAge, setDesiredRetirementAge] = useState<number>(67);

  const [annualPreTaxIncome, setAnnualPreTaxIncome] = useState<number>(60000);
  const [currentRetirementSavings, setCurrentRetirementSavings] =
    useState<number>(30000);

  const [monthlyContributions, setMonthlyContributions] = useState<number>(500);
  const [swipeMonthlyContributions, setSwipeMonthlyContributions] =
    useState<number>(200);

  // Renamed label from “Annual Budget in Retirement” to “Annual Retirement Budget”
  const [annualBudgetInRetirement, setAnnualBudgetInRetirement] =
    useState<number>(40000);

  const [otherRetirementIncome, setOtherRetirementIncome] = useState<number>(0);

  // B. Basic assumptions
  const annualRateOfReturn = 7; // e.g., 7%
  const withdrawalRate = 4;     // 4% safe withdrawal rate
  const yearsInRetirement = 25; // we assume 25 years in retirement

  // Derived
  const yearsUntilRetirement = Math.max(0, desiredRetirementAge - currentAge);
  const totalMonthsUntilRetirement = yearsUntilRetirement * 12;

  // C. Future Value at retirement (User + Swipe)
  const userFV = useMemo(() => {
    return futureValueMonthlyCompounding(
      currentRetirementSavings,
      monthlyContributions,
      annualRateOfReturn,
      totalMonthsUntilRetirement
    );
  }, [
    currentRetirementSavings,
    monthlyContributions,
    annualRateOfReturn,
    totalMonthsUntilRetirement,
  ]);

  const swipeFV = useMemo(() => {
    return futureValueMonthlyCompounding(
      0,
      swipeMonthlyContributions,
      annualRateOfReturn,
      totalMonthsUntilRetirement
    );
  }, [
    swipeMonthlyContributions,
    annualRateOfReturn,
    totalMonthsUntilRetirement,
  ]);

  const totalFV = userFV + swipeFV;

  // “What We Want”
  const netAnnualNeeded = annualBudgetInRetirement - otherRetirementIncome;
  const requiredNestEgg = useMemo(() => {
    const wr = withdrawalRate / 100; // 0.04 for 4%
    return Math.floor((netAnnualNeeded * yearsInRetirement) / wr);
  }, [netAnnualNeeded, yearsInRetirement, withdrawalRate]);

  // On track?
  const onTrack = totalFV >= requiredNestEgg;

  // Age retirement savings runs out (for current plan)
  const currentRunoutAge = useMemo(() => {
    return calcRetirementRunoutAge(
      userFV,
      swipeFV,
      annualRateOfReturn,
      netAnnualNeeded
    );
  }, [userFV, swipeFV, annualRateOfReturn, netAnnualNeeded]);

  // D. Target Plan
  const targetMonthlyContribution = useMemo(() => {
    return findTargetMonthlyContribution(
      currentRetirementSavings,
      annualRateOfReturn,
      totalMonthsUntilRetirement,
      requiredNestEgg,
      monthlyContributions
    );
  }, [
    currentRetirementSavings,
    annualRateOfReturn,
    totalMonthsUntilRetirement,
    requiredNestEgg,
    monthlyContributions,
  ]);

  const targetUserFV = useMemo(() => {
    return futureValueMonthlyCompounding(
      currentRetirementSavings,
      targetMonthlyContribution,
      annualRateOfReturn,
      totalMonthsUntilRetirement
    );
  }, [
    currentRetirementSavings,
    targetMonthlyContribution,
    annualRateOfReturn,
    totalMonthsUntilRetirement,
  ]);
  const targetTotalFV = targetUserFV + swipeFV;
  const targetRunoutAge = useMemo(() => {
    return calcRetirementRunoutAge(
      targetUserFV,
      swipeFV,
      annualRateOfReturn,
      netAnnualNeeded
    );
  }, [targetUserFV, swipeFV, annualRateOfReturn, netAnnualNeeded]);

  // E. Chart Data
  interface ChartItem {
    year: number;
    userPortion: number;
    swipePortion: number;
    whatWeWant: number;
  }

  const chartData: ChartItem[] = useMemo(() => {
    const data: ChartItem[] = [];
    let userBalance = currentRetirementSavings;
    let swipeBalance = 0;
    const monthlyRate = annualRateOfReturn / 100 / 12;

    for (let y = 0; y <= yearsUntilRetirement; y++) {
      data.push({
        year: currentAge + y,
        userPortion: Math.floor(userBalance),
        swipePortion: Math.floor(swipeBalance),
        whatWeWant: requiredNestEgg,
      });

      for (let m = 0; m < 12; m++) {
        if (y === yearsUntilRetirement) break;
        userBalance = userBalance * (1 + monthlyRate) + monthlyContributions;
        swipeBalance = swipeBalance * (1 + monthlyRate) + swipeMonthlyContributions;
      }
    }
    return data;
  }, [
    currentAge,
    currentRetirementSavings,
    monthlyContributions,
    swipeMonthlyContributions,
    yearsUntilRetirement,
    annualRateOfReturn,
    requiredNestEgg,
  ]);

  // F. Toggle: Graph vs. Summary
  const [view, setView] = useState<"graph" | "summary">("graph");

  // RENDER
  return (
    <Container className="main-box">
      <MainHeading variant="h4">Retirement Calculator</MainHeading>

      <Grid container columns={16} columnSpacing={{ xs: 2, md: 2 }}>
        {/* LEFT: Input Fields */}
        <Grid xs={16} md={4} item>
          {/* minHeight = 600 to match right side */}
          <Grid className="left-stack" sx={{ minHeight: 600 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#293a60", mb: 1 }}
            >
              Retirement Details
            </Typography>

            {/* Each field has slightly smaller label & less margin to reduce height */}
            <Box sx={{ mb: 1.5 }}>
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.95rem",
                  color: "#293a60",
                  mb: 0.5,
                }}
              >
                Current Age
              </Typography>
              <SwipeStyleInput
                value={currentAge}
                onChange={(e) => setCurrentAge(Number(e.target.value))}
              />
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.95rem",
                  color: "#293a60",
                  mb: 0.5,
                }}
              >
                Desired Retirement Age
              </Typography>
              <SwipeStyleInput
                value={desiredRetirementAge}
                onChange={(e) => setDesiredRetirementAge(Number(e.target.value))}
              />
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.95rem",
                  color: "#293a60",
                  mb: 0.5,
                }}
              >
                Annual Pre-Tax Income
              </Typography>
              <SwipeStyleInput
                value={annualPreTaxIncome}
                onChange={(e) => setAnnualPreTaxIncome(Number(e.target.value))}
              />
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.95rem",
                  color: "#293a60",
                  mb: 0.5,
                }}
              >
                Current Retirement Savings
              </Typography>
              <SwipeStyleInput
                value={currentRetirementSavings}
                onChange={(e) => setCurrentRetirementSavings(Number(e.target.value))}
              />
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.95rem",
                  color: "#293a60",
                  mb: 0.5,
                }}
              >
                Monthly Contributions
              </Typography>
              <SwipeStyleInput
                value={monthlyContributions}
                onChange={(e) => setMonthlyContributions(Number(e.target.value))}
              />
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.95rem",
                  color: "#293a60",
                  mb: 0.5,
                }}
              >
                SwipeSwipe Contributions
              </Typography>
              <SwipeStyleInput
                value={swipeMonthlyContributions}
                onChange={(e) =>
                  setSwipeMonthlyContributions(Number(e.target.value))
                }
              />
            </Box>

            {/* “Annual Retirement Budget” to keep it in one line */}
            <Box sx={{ mb: 1.5 }}>
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.95rem",
                  color: "#293a60",
                  mb: 0.5,
                }}
              >
                Annual Retirement Budget
              </Typography>
              <SwipeStyleInput
                value={annualBudgetInRetirement}
                onChange={(e) =>
                  setAnnualBudgetInRetirement(Number(e.target.value))
                }
              />
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.95rem",
                  color: "#293a60",
                  mb: 0.5,
                }}
              >
                Other Retirement Income
              </Typography>
              <SwipeStyleInput
                value={otherRetirementIncome}
                onChange={(e) =>
                  setOtherRetirementIncome(Number(e.target.value))
                }
              />
            </Box>
          </Grid>
        </Grid>

        {/* RIGHT: Outputs & Chart or Summary */}
        <Grid xs={16} md={12} item>
          {/* Also minHeight = 600 on right stack */}
          <Grid className="right-stack" sx={{ minHeight: 600 }}>
            {/* 3 small output items */}
            <Box
              sx={{
                display: "flex",
                gap: 3,
                justifyContent: "center",
                flexWrap: "wrap",
                mb: 2,
              }}
            >
              <Box>
                <Typography variant="subtitle2" sx={{ color: "grey" }}>
                  What We Have
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#293a60" }}>
                  ${formatNumber(totalFV)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ color: "grey" }}>
                  What We Want
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#293a60" }}>
                  ${formatNumber(requiredNestEgg)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ color: "grey" }}>
                  SwipeSwipe Portion
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#293a60" }}>
                  ${formatNumber(swipeFV)}
                </Typography>
              </Box>
            </Box>

            {/* "You are on track" message, center aligned */}
            <Box sx={{ mb: 2, textAlign: "center" }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: onTrack ? "green" : "red",
                }}
              >
                {onTrack
                  ? "You're on track for retirement!"
                  : "You may need to save more or adjust your expectations."}
              </Typography>
            </Box>

            {/* Toggle */}
            <ToggleButtonGroup
              color="primary"
              value={view}
              exclusive
              onChange={(_, val) => val && setView(val)}
              sx={{ mb: 2 }}
            >
              <ToggleButton value="graph">GRAPH VIEW</ToggleButton>
              <ToggleButton value="summary">SUMMARY VIEW</ToggleButton>
            </ToggleButtonGroup>

            <ChartOrSummaryContainer>
              {/* GRAPH VIEW */}
              {view === "graph" && (
                <Box sx={{ width: "100%" }}>
                  <RetirementChart
                    data={chartData}
                    tooltip={<CustomGraphTooltip chartData={chartData} />}
                  />
                </Box>
              )}

              {/* SUMMARY VIEW */}
              {view === "summary" && (
                <Box sx={{ width: "100%" }}>
                  <Card sx={{ p: 2, borderRadius: 3, textAlign: "left" }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 2, fontWeight: 600, color: "#293a60" }}
                    >
                      Summary of Your Retirement Plan
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 2,
                      }}
                    >
                        {/* LEFT: Current retirement plan */}
                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700, mb: 1, color: "#293a60" }}
                          >
                            Current retirement plan
                          </Typography>
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <tbody>
                              <tr>
                                <td style={{ padding: "4px" }}>Total retirement savings</td>
                                <td style={{ padding: "4px", fontWeight: 600 }}>
                                  ${formatNumber(totalFV)}
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: "4px" }}>Monthly contribution</td>
                                <td style={{ padding: "4px", fontWeight: 600 }}>
                                  ${formatNumber(monthlyContributions)}
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: "4px" }}>SwipeSwipe contribution</td>
                                <td style={{ padding: "4px", fontWeight: 600 }}>
                                  ${formatNumber(swipeMonthlyContributions)}
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: "4px" }}>Age retirement savings runs out</td>
                                <td style={{ padding: "4px", fontWeight: 600 }}>
                                  {currentRunoutAge === null ? "--" : currentRunoutAge}
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: "4px" }}>On track?</td>
                                <td
                                  style={{
                                    padding: "4px",
                                    fontWeight: 600,
                                    color: onTrack ? "green" : "red",
                                  }}
                                >
                                  {onTrack ? "Yes" : "No"}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </Box>

                        {/* RIGHT: Target retirement plan */}
                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700, mb: 1, color: "#293a60" }}
                          >
                            Target retirement plan
                          </Typography>
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <tbody>
                              <tr>
                                <td style={{ padding: "4px" }}>Total retirement savings</td>
                                <td style={{ padding: "4px", fontWeight: 600 }}>
                                  ${formatNumber(targetTotalFV)}
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: "4px" }}>Monthly contribution</td>
                                <td style={{ padding: "4px", fontWeight: 600 }}>
                                  ${formatNumber(targetMonthlyContribution)}
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: "4px" }}>SwipeSwipe contribution</td>
                                <td style={{ padding: "4px", fontWeight: 600 }}>
                                  ${formatNumber(swipeMonthlyContributions)}
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: "4px" }}>Age retirement savings runs out</td>
                                <td style={{ padding: "4px", fontWeight: 600 }}>
                                  {targetRunoutAge === null ? "--" : targetRunoutAge}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </Box>
                    </Box>
                  </Card>
                </Box>
              )}
            </ChartOrSummaryContainer>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

//
// 3. Re-usable input with smaller padding so overall height is reduced
//
const SwipeStyleInputField = styled(TextField)({
  "& .MuiInputBase-root": {
    backgroundColor: "#FBC950",
    borderRadius: "5px",
  },
  "& .MuiInputBase-input": {
    textAlign: "left",
    fontSize: "16px",      // slightly smaller
    fontWeight: "bold",
    color: "#2C3E50",
    padding: "8px 12px",   // reduced from 10px 14px
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#F9D46D",
  },
  "& .MuiSvgIcon-root": {
    color: "#2C3E50",
  },
});

const NumericFormatSwipe = React.forwardRef<HTMLInputElement, NumericFormatProps>(
  function NumericFormatSwipe(props, ref) {
    const { onChange, min = 0, max, ...other } = props;
    return (
      <NumericFormat
        {...other}
        getInputRef={ref}
        onValueChange={(values) => {
          onChange &&
            onChange({
              target: {
                name: props.name,
                value: values.value,
              },
            } as any);
        }}
        thousandSeparator
        isAllowed={(values) => {
          if (max === undefined) return true;
          return values.value >= min && values.value <= max;
        }}
      />
    );
  }
);

interface SwipeStyleInputProps {
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  [key: string]: any;
}

const SwipeStyleInput: React.FC<SwipeStyleInputProps> = ({
  value,
  onChange,
  ...other
}) => {
  return (
    <SwipeStyleInputField
      InputProps={{
        inputComponent: NumericFormatSwipe as any,
        inputProps: {
          value,
          onChange,
        },
      }}
      {...other}
    />
  );
};

export default RetirementCalculator;
