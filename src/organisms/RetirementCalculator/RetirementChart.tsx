import React from "react";
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

import CustomGraphTooltip from "../../atom/CustomGraphTooltip/CustomGraphTooltip";

interface ChartItem {
  year: number;
  userPortion: number;
  swipePortion: number;
  whatWeWant: number;
}

interface RetirementChartProps {
  data: ChartItem[];
  tooltip?: React.ReactNode;
}

// const RetirementChart: React.FC<RetirementChartProps> = ({ data, tooltip }) => {
const RetirementChart: React.FC<RetirementChartProps> = ({ data }) => {
  // We'll map a "whatWeHave" field
  const chartData = data.map((item) => ({
    ...item,
    whatWeHave: item.userPortion ,
    // whatWeHave: item.userPortion + item.swipePortion,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <defs>
          <linearGradient id="colorHave" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.7} />
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorSwipe" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FBC950" stopOpacity={0.7} />
            <stop offset="95%" stopColor="#FBC950" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorWant" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.7} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" stroke="#949EAB" />
        <YAxis
          stroke="#949EAB"
          tickFormatter={(tick) => `$${(tick / 1000).toFixed(0)}k`}
        />
        <Tooltip
  content={(props) => <CustomGraphTooltip {...props} chartData={chartData} />}
/>
        <Legend />

        {/* 1. What We Have */}
        <Area
          type="monotone"
          dataKey="whatWeHave"
          name="What We Have"
          stroke="#82ca9d"
          strokeWidth={3}
          fill="url(#colorHave)"
          fillOpacity={1}
        />
        {/* 2. SwipeSwipe */}
        <Area
          type="monotone"
          dataKey="swipePortion"
          name="SwipeSwipe"
          stroke="#FBC950"
          strokeWidth={3}
          fill="url(#colorSwipe)"
          fillOpacity={0.6}
          strokeDasharray="5 5"
        />
        {/* 3. What We Want */}
        <Area
          type="monotone"
          dataKey="whatWeWant"
          name="What We Want"
          stroke="#8884d8"
          strokeWidth={3}
          fill="url(#colorWant)"
          fillOpacity={0.4}
          strokeDasharray="3 3"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default RetirementChart;
