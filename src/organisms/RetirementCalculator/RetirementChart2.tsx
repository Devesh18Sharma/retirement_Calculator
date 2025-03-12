// src/organisms/RetirementCalculator/RetirementChartExtended.tsx

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/** Same shape as your normal chart data */
interface ChartItem {
  year: number;
  userPortion: number;
  swipePortion: number;
  whatWeWant: number;
}

interface Props {
  data: ChartItem[];
}

const RetirementChart: React.FC<Props> = ({ data }) => {
  // The last year in your data is the retirement year. We'll extend from that year to 95.
  const lastYear = data[data.length - 1]?.year || 67;

  // Generate an extended array with a decline after retirement
  const extendedData = useMemo(() => {
    if (!data.length) return [];
    const result = [...data];

    // The final data point at retirement
    const finalPoint = data[data.length - 1];
    const finalUser = finalPoint.userPortion;
    const finalSwipe = finalPoint.swipePortion;
    const finalWant = finalPoint.whatWeWant;

    const retirementAge = lastYear;
    const maxAge = 95;
    const yearsInRetirement = maxAge - retirementAge;

    for (let i = 1; i <= yearsInRetirement; i++) {
      const age = retirementAge + i;
      // simple linear or non-linear decay factor
      const factor = i / yearsInRetirement;

      const userVal = Math.floor(finalUser * (1 - factor));
      const swipeVal = Math.floor(finalSwipe * (1 - factor));
      const wantVal = Math.floor(finalWant * (1 - factor * 0.8)); // or keep it flat, your choice

      result.push({
        year: age,
        userPortion: Math.max(0, userVal),
        swipePortion: Math.max(0, swipeVal),
        whatWeWant: Math.max(0, wantVal),
      });
    }
    return result;
  }, [data, lastYear]);

  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer>
        <AreaChart
          data={extendedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="colorUser" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorSwipe" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FBC950" stopOpacity={0.7} />
              <stop offset="95%" stopColor="#FBC950" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorWant" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis
            tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
          />
          <Tooltip />
          <Legend />

          <Area
            type="monotone"
            dataKey="userPortion"
            name="Your Savings"
            stroke="#10B981"
            fill="url(#colorUser)"
            stackId="1"
          />
          <Area
            type="monotone"
            dataKey="swipePortion"
            name="SwipeSwipe"
            stroke="#FBC950"
            fill="url(#colorSwipe)"
            stackId="1"
          />
          <Area
            type="monotone"
            dataKey="whatWeWant"
            name="Goal"
            stroke="#6366F1"
            fill="url(#colorWant)"
            strokeDasharray="3 3"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RetirementChart;
