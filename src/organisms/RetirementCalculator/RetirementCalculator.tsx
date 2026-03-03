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
  Divider,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Recharts + custom tooltips
import RetirementChart from "./RetirementChart2";
import CustomGraphTooltip from "../../atom/CustomGraphTooltip/CustomGraphTooltip";

// Calculation helpers
import {
  futureValueMonthlyCompounding,
  calcRetirementRunoutAge,
  findTargetMonthlyContribution,
} from "../../utils/calculations";

// Use the SwipeNumberField component for consistent input
import SwipeNumberField from "../../atom/SwipeNumberField/SwipeNumberField";

// Logo
import swipeswipeLogo from "../../assets/swipeswipe_logo.png";

//
// 1. STYLED COMPONENTS
//

// Header bar with logo and title
const HeaderBar = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  paddingTop: 20,
  paddingBottom: 16,
}));

const HeaderLogo = styled("img")(() => ({
  height: 40,
  width: "auto",
}));

const HeaderTitle = styled(Typography)(() => ({
  fontFamily: "Caudex, Arial, sans-serif",
  fontWeight: 700,
  color: "#293a60",
}));

// A container that ensures Graph & Summary have the same height
const ChartOrSummaryContainer = styled("div")(() => ({
  minHeight: 380,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

// Summary box for key metrics
const SummaryBox = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  justifyContent: "center",
  flexWrap: "wrap",
  marginBottom: theme.spacing(1),
  padding: theme.spacing(1.5),
  backgroundColor: "#f8f9fa",
  borderRadius: theme.spacing(1),
}));

// Item in the summary box
const SummaryItem = styled(Box)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(1),
  minWidth: "150px",
}));

// Info chip for fixed values
const InfoChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: "#e3f2fd",
  color: "#1976d2",
  fontWeight: 500,
}));

// Status message box
const StatusBox = styled(Box)<{ onTrack: boolean }>(({ onTrack, theme }) => ({
  marginBottom: theme.spacing(1),
  textAlign: "center",
  padding: theme.spacing(0.75),
  backgroundColor: onTrack ? "rgba(0, 128, 0, 0.1)" : "rgba(255, 0, 0, 0.1)",
  borderRadius: theme.spacing(1),
  color: onTrack ? "green" : "red",
  fontWeight: 600,
}));

// Input form label
const InputLabel = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  fontSize: "0.95rem",
  color: "#293a60",
  marginBottom: theme.spacing(0.5),
}));

// Summary table styling
const SummaryTable = styled("table")(() => ({
  width: "100%",
  borderCollapse: "collapse",
  "& td": {
    padding: "5px 4px",
    fontSize: "0.85rem",
    borderBottom: "1px solid #f0f0f0",
  },
  "& tr:last-child td": {
    borderBottom: "none",
  },
}));

// Helper to format large numbers with commas
const formatNumber = (val: number) =>
  val.toLocaleString("en-US", { maximumFractionDigits: 0 });

// Reusable input field — defined at module scope to maintain stable identity across re-renders
interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  prefix?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max,
  prefix = "",
}) => (
  <Box sx={{ mb: 1.5 }}>
    <InputLabel>{label}</InputLabel>
    <SwipeNumberField
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        onChange(Number(e.target.value))
      }
      min={min}
      max={max}
      prefix={prefix}
      fullWidth
      sx={{ my: 0.5 }}
    />
  </Box>
);

// Constants for input validation
const MAX_AGE = 150;
const MAX_ANNUAL_INCOME = 5000000;
const MAX_CURRENT_SAVINGS = 5000000;
const MAX_MONTHLY_CONTRIBUTION = 50000;
const SWIPE_MONTHLY_CONTRIBUTION = 200; // Fixed at $200/month
const FIXED_RETIREMENT_AGE = 67; // Fixed retirement age at 67
const DEFAULT_ANNUAL_RATE_OF_RETURN = 7; // 7%
const DEFAULT_WITHDRAWAL_RATE = 4; // 4%

//
// 2. MAIN COMPONENT
//
const RetirementCalculator: React.FC = () => {
  // A. State: input fields
  const [currentAge, setCurrentAge] = useState<number>(35);
  const desiredRetirementAge = FIXED_RETIREMENT_AGE;

  const [annualPreTaxIncome, setAnnualPreTaxIncome] = useState<number>(60000);
  const [currentRetirementSavings, setCurrentRetirementSavings] = useState<number>(30000);
  const [monthlyContributions, setMonthlyContributions] = useState<number>(500);
  const swipeMonthlyContributions = SWIPE_MONTHLY_CONTRIBUTION;

  const [annualBudgetInRetirement, setAnnualBudgetInRetirement] = useState<number>(40000);
  const [otherRetirementIncome, setOtherRetirementIncome] = useState<number>(0);

  // B. Financial assumptions
  const annualRateOfReturn = DEFAULT_ANNUAL_RATE_OF_RETURN; // e.g., 7%
  const withdrawalRate = DEFAULT_WITHDRAWAL_RATE;     // 4% safe withdrawal rate

  // C. Derived calculations
  const yearsUntilRetirement = Math.max(0, desiredRetirementAge - currentAge);
  const totalMonthsUntilRetirement = yearsUntilRetirement * 12;


  // E. Future Value calculations
  // We calculate user and swipe separately for visualization
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
      0, // SwipeSwipe starts at 0
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

  // F. What we want - Required Retirement Savings
  const netAnnualNeeded = annualBudgetInRetirement - otherRetirementIncome;
  const requiredNestEgg = useMemo(() => {
    const wr = withdrawalRate / 100; // 0.04 for 4%
    return Math.ceil(netAnnualNeeded / wr);
  }, [netAnnualNeeded, withdrawalRate]);

  // G. Calculate Annual Retirement Income (what our savings will provide)
  const annualRetirementIncome = useMemo(() => {
    const wr = withdrawalRate / 100; // 0.04 for 4%
    return Math.floor(totalFV * wr); // Using the 4% rule
  }, [totalFV, withdrawalRate]);

  // H1. Income-based metrics (makes Annual Pre-Tax Income meaningful)
  const currentSavingsRate = useMemo(() => {
    if (annualPreTaxIncome <= 0) return 0;
    return ((monthlyContributions * 12) / annualPreTaxIncome) * 100;
  }, [monthlyContributions, annualPreTaxIncome]);

  const incomeReplacementRatio = useMemo(() => {
    if (annualPreTaxIncome <= 0) return 0;
    return (annualRetirementIncome / annualPreTaxIncome) * 100;
  }, [annualRetirementIncome, annualPreTaxIncome]);

  // H. On track assessment
  const onTrack = totalFV >= requiredNestEgg;

  // I. Age retirement savings runs out (for current plan)
  const currentRunoutAge = useMemo(() => {
    return calcRetirementRunoutAge(
      userFV,
      swipeFV,
      annualRateOfReturn,
      netAnnualNeeded
    );
  }, [userFV, swipeFV, annualRateOfReturn, netAnnualNeeded]);

  // J. Target Plan
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

  // K. Chart Data
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

      if (y < yearsUntilRetirement) {
        for (let m = 0; m < 12; m++) {
          userBalance = userBalance * (1 + monthlyRate) + monthlyContributions;
          swipeBalance = swipeBalance * (1 + monthlyRate) + swipeMonthlyContributions;
        }
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

  // L. Toggle: Graph vs. Summary
  const [view, setView] = useState<"graph" | "summary">("graph");

  // Render input form section
  const renderInputForm = () => (
    <Grid className="left-stack" sx={{ height: "100%" }}>
      <Typography
        variant="h6"
        sx={{ fontWeight: "bold", color: "#293a60", mb: 1 }}
      >
        Retirement Details
      </Typography>

      <InputField
        label="Current Age"
        value={currentAge}
        onChange={setCurrentAge}
        min={0}
        max={MAX_AGE}
      />

      <InputField
        label="Annual Pre-Tax Income"
        value={annualPreTaxIncome}
        onChange={setAnnualPreTaxIncome}
        min={0}
        max={MAX_ANNUAL_INCOME}
        prefix="$"
      />

      <InputField
        label="Current Retirement Savings"
        value={currentRetirementSavings}
        onChange={setCurrentRetirementSavings}
        min={0}
        max={MAX_CURRENT_SAVINGS}
        prefix="$"
      />

      <InputField
        label="Monthly Contributions"
        value={monthlyContributions}
        onChange={setMonthlyContributions}
        min={0}
        max={MAX_MONTHLY_CONTRIBUTION}
        prefix="$"
      />

      <InputField
        label="Annual Retirement Budget"
        value={annualBudgetInRetirement}
        onChange={setAnnualBudgetInRetirement}
        min={0}
        max={MAX_ANNUAL_INCOME}
        prefix="$"
      />

      <InputField
        label="Other Retirement Income"
        value={otherRetirementIncome}
        onChange={setOtherRetirementIncome}
        min={0}
        max={MAX_ANNUAL_INCOME}
        prefix="$"
      />
    </Grid>
  );

  // Render results section
  const renderResults = () => (
    <Grid className="right-stack" sx={{ height: "100%" }}>
      {/* Fixed Values Info */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1, flexWrap: 'wrap' }}>
        <InfoChip label={`Retirement Age: ${FIXED_RETIREMENT_AGE}`} />
        <InfoChip label={`SwipeSwipe: $${SWIPE_MONTHLY_CONTRIBUTION}/month`} />
        <InfoChip label={`Return Rate: ${annualRateOfReturn}%`} />
        <InfoChip label={`Withdrawal Rate: ${withdrawalRate}%`} />
      </Box>

      {/* Summary metrics */}
      <SummaryBox>
        <SummaryItem>
          <Typography variant="subtitle2" sx={{ color: "grey" }}>
            What We Have
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#293a60" }}>
            ${formatNumber(totalFV)}
          </Typography>
          <Typography variant="body2" sx={{ color: "grey" }}>
            Annual Income: ${formatNumber(annualRetirementIncome)}
          </Typography>
        </SummaryItem>
        <SummaryItem>
          <Typography variant="subtitle2" sx={{ color: "grey" }}>
            What We Want
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#293a60" }}>
            ${formatNumber(requiredNestEgg)}
          </Typography>
          <Typography variant="body2" sx={{ color: "grey" }}>
            Annual Budget: ${formatNumber(annualBudgetInRetirement)}
          </Typography>
        </SummaryItem>
        <SummaryItem>
          <Typography variant="subtitle2" sx={{ color: "grey" }}>
            SwipeSwipe Portion
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#293a60" }}>
            ${formatNumber(swipeFV)}
          </Typography>
          <Typography variant="body2" sx={{ color: "grey" }}>
            {totalFV > 0 ? Math.round((swipeFV / totalFV) * 100) : 0}% of Total
          </Typography>
        </SummaryItem>
      </SummaryBox>

      {/* Compact income-based insights — single row of inline chips */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, mb: 1, flexWrap: "wrap" }}>
        <Chip
          size="small"
          label={`Savings Rate: ${currentSavingsRate.toFixed(1)}% ${currentSavingsRate >= 15 ? "\u2713" : "(target 15%+)"}`}
          sx={{
            backgroundColor: currentSavingsRate >= 15 ? "#e6f4ea" : "#fef7e0",
            color: currentSavingsRate >= 15 ? "#1e7e34" : "#92400e",
            fontWeight: 600,
            fontSize: "0.75rem",
          }}
        />
        <Chip
          size="small"
          label={`Income Replacement: ${incomeReplacementRatio.toFixed(0)}% ${incomeReplacementRatio >= 70 ? "\u2713" : "(target 70-80%)"}`}
          sx={{
            backgroundColor: incomeReplacementRatio >= 70 ? "#e6f4ea" : "#fef7e0",
            color: incomeReplacementRatio >= 70 ? "#1e7e34" : "#92400e",
            fontWeight: 600,
            fontSize: "0.75rem",
          }}
        />
      </Box>

      {/* Status message */}
      <StatusBox onTrack={onTrack}>
        {onTrack
          ? "You're on track for retirement!"
          : "You may need to save more or adjust your expectations."}
      </StatusBox>

      {/* Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <ToggleButtonGroup
          color="primary"
          value={view}
          exclusive
          onChange={(_, val) => val && setView(val)}
          size="small"
        >
          <ToggleButton value="graph">GRAPH VIEW</ToggleButton>
          <ToggleButton value="summary">SUMMARY VIEW</ToggleButton>
        </ToggleButtonGroup>
      </Box>

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
          <Box sx={{ width: "100%", alignSelf: "flex-start" }}>
            <Card sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
              <Typography
                variant="h6"
                sx={{ mb: 1, fontWeight: 600, color: "#293a60" }}
              >
                Summary of Your Retirement Plan
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                {/* LEFT: Current retirement plan */}
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, mb: 1, color: "#293a60" }}
                  >
                    Current Plan
                  </Typography>
                  <SummaryTable>
                    <tbody>
                      <tr>
                        <td>Years until retirement</td>
                        <td style={{ fontWeight: 600, textAlign: "right" }}>
                          {yearsUntilRetirement}
                        </td>
                      </tr>
                      <tr>
                        <td>Total retirement savings</td>
                        <td style={{ fontWeight: 600, textAlign: "right" }}>
                          ${formatNumber(totalFV)}
                        </td>
                      </tr>
                      <tr>
                        <td>Annual retirement income</td>
                        <td style={{ fontWeight: 600, textAlign: "right" }}>
                          ${formatNumber(annualRetirementIncome)}
                        </td>
                      </tr>
                      <tr>
                        <td>Monthly contribution</td>
                        <td style={{ fontWeight: 600, textAlign: "right" }}>
                          ${formatNumber(monthlyContributions)}
                        </td>
                      </tr>
                      <tr>
                        <td>SwipeSwipe contribution</td>
                        <td style={{ fontWeight: 600, textAlign: "right" }}>
                          ${formatNumber(swipeMonthlyContributions)}
                        </td>
                      </tr>
                      <tr>
                        <td>Savings run out at age</td>
                        <td style={{ fontWeight: 600, textAlign: "right" }}>
                          {currentRunoutAge === null ? "Never" : currentRunoutAge}
                        </td>
                      </tr>
                      <tr>
                        <td>On track?</td>
                        <td
                          style={{
                            fontWeight: 600,
                            textAlign: "right",
                            color: onTrack ? "green" : "red",
                          }}
                        >
                          {onTrack ? "Yes" : "No"}
                        </td>
                      </tr>
                    </tbody>
                  </SummaryTable>
                </Box>

                {/* RIGHT: Target retirement plan */}
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, mb: 1, color: "#293a60" }}
                  >
                    Target Plan
                  </Typography>
                  <SummaryTable>
                    <tbody>
                      <tr>
                        <td>Target retirement savings</td>
                        <td style={{ fontWeight: 600, textAlign: "right" }}>
                          ${formatNumber(requiredNestEgg)}
                        </td>
                      </tr>
                      <tr>
                        <td>Projected with target</td>
                        <td style={{ fontWeight: 600, textAlign: "right" }}>
                          ${formatNumber(targetTotalFV)}
                        </td>
                      </tr>
                      <tr>
                        <td>Recommended monthly</td>
                        <td style={{ fontWeight: 600, textAlign: "right" }}>
                          ${formatNumber(targetMonthlyContribution)}
                        </td>
                      </tr>
                      <tr>
                        <td>SwipeSwipe contribution</td>
                        <td style={{ fontWeight: 600, textAlign: "right" }}>
                          ${formatNumber(swipeMonthlyContributions)}
                        </td>
                      </tr>
                      <tr>
                        <td>SwipeSwipe impact</td>
                        <td style={{ fontWeight: 600, textAlign: "right" }}>
                          ${formatNumber(swipeFV)} ({totalFV > 0 ? Math.round((swipeFV / totalFV) * 100) : 0}%)
                        </td>
                      </tr>
                      <tr>
                        <td>Shortfall / surplus</td>
                        <td style={{
                          fontWeight: 600,
                          textAlign: "right",
                          color: totalFV >= requiredNestEgg ? "green" : "red"
                        }}>
                          ${formatNumber(totalFV - requiredNestEgg)}
                        </td>
                      </tr>
                      <tr>
                        <td>Savings run out at age</td>
                        <td style={{ fontWeight: 600, textAlign: "right" }}>
                          {targetRunoutAge === null ? "Never" : targetRunoutAge}
                        </td>
                      </tr>
                    </tbody>
                  </SummaryTable>
                </Box>
              </Box>

              <Divider sx={{ my: 1.5 }} />

              <Box sx={{ px: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Recommendations:
                </Typography>

                <Typography variant="body2" gutterBottom>
                  {onTrack
                    ? "You're on track to meet your retirement goals. Consider increasing your SwipeSwipe savings for even more security."
                    : `To reach your retirement goal, consider increasing your monthly contributions by $${formatNumber(Math.max(0, targetMonthlyContribution - monthlyContributions))}.`
                  }
                </Typography>

                <Typography variant="body2" color="primary" sx={{ fontWeight: 500, mt: 0.5 }}>
                  SwipeSwipe's $200/month contribution adds ${formatNumber(swipeFV)} to your retirement savings!
                </Typography>
              </Box>
            </Card>
          </Box>
        )}
      </ChartOrSummaryContainer>
    </Grid>
  );

  // RENDER
  return (
    <Container className="main-box">
      <HeaderBar>
        <HeaderLogo src={swipeswipeLogo} alt="SwipeSwipe" />
        <HeaderTitle variant="h4">Retirement Calculator</HeaderTitle>
      </HeaderBar>

      <Grid container columns={16} columnSpacing={{ xs: 2, md: 3 }} sx={{ minHeight: 620 }}>
        {/* LEFT: Input Fields */}
        <Grid xs={16} md={4} item sx={{ display: 'flex', flexDirection: 'column' }}>
          {renderInputForm()}
        </Grid>

        {/* RIGHT: Outputs & Chart or Summary */}
        <Grid xs={16} md={12} item sx={{ display: 'flex', flexDirection: 'column' }}>
          {renderResults()}
        </Grid>
      </Grid>
    </Container>
  );
};

export default RetirementCalculator;
