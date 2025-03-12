/**
 * Future Value with Monthly Compounding
 * 
 * This uses the standard compound interest formula with regular contributions:
 * FV = P(1+r)^t + C[((1+r)^t - 1)/r]
 * 
 * Where:
 * P = Initial balance
 * C = Monthly contribution
 * r = Monthly interest rate
 * t = Total months
 */
export function futureValueMonthlyCompounding(
  initialBalance: number,
  monthlyContribution: number,
  annualRate: number,
  totalMonths: number
): number {
  // Convert annual rate to monthly rate (as a decimal)
  const monthlyRate = annualRate / 100 / 12;
  
  if (monthlyRate === 0) {
    // Simple calculation if rate is 0
    return initialBalance + monthlyContribution * totalMonths;
  }
  
  // Calculate using the compound interest formula
  const principalFV = initialBalance * Math.pow(1 + monthlyRate, totalMonths);
  const contributionsFV = monthlyContribution * 
    ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
  
  return principalFV + contributionsFV;
}

/**
 * Projects from retirement age to 95, subtracting monthlyNeeded each month,
 * while also applying monthlyRate. Returns the age at which balance hits 0,
 * or null if it never depletes before 95.
 */
export function calcRetirementRunoutAge(
  userFV: number,
  swipeFV: number,
  annualRate: number,
  netAnnualNeeded: number
): number | null {
  let total = userFV + swipeFV;
  if (total <= 0) return null;
  
  const monthlyRate = annualRate / 100 / 12;
  const monthlyNeeded = netAnnualNeeded / 12;
  
  // We assume we check from retirement age up to 95
  let age = 0;
  for (age = 0; age <= 95 - 67; age++) {
    // 12 months in each year
    for (let m = 0; m < 12; m++) {
      total *= 1 + monthlyRate;
      total -= monthlyNeeded;
      if (total <= 0) {
        // We ran out
        return 67 + age; // e.g. if you retire at 67
      }
    }
  }
  // If we never hit 0 by age 95, return 95
  return 95;
}

/**
 * Finds a monthly contribution that yields final = requiredNestEgg at retirement,
 * using a simple binary search from -1e6 to 1e6. If your plan already exceeds
 * requiredNestEgg, it may return a negative contribution (meaning you can reduce
 * your monthly contributions).
 */
export function findTargetMonthlyContribution(
  currentRetirementSavings: number,
  annualRate: number,
  totalMonths: number,
  requiredNestEgg: number,
  startGuess: number
): number {
  let low = -1000000;  // you can adjust as needed
  let high = 1000000;
  let guess = startGuess;
  
  for (let i = 0; i < 40; i++) {
    const finalVal = futureValueMonthlyCompounding(
      currentRetirementSavings,
      guess,
      annualRate,
      totalMonths
    );
    if (finalVal > requiredNestEgg) {
      // We can reduce monthly contributions
      high = guess;
    } else {
      // We need more monthly contributions
      low = guess;
    }
    guess = (low + high) / 2;
  }
  return Math.floor(guess);
}