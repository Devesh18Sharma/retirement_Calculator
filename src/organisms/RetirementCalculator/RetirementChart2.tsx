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

interface ChartItem {
  year: number;
  userPortion: number;
  swipePortion: number;
  whatWeWant: number;
}

interface RetirementChartProps {
  data: ChartItem[];
}

const RetirementChart: React.FC<RetirementChartProps> = ({ data }) => {
  // Calculate the maximum age to extend our projection
  const lastYear = data[data.length - 1]?.year || 0;
  // const firstYear = data[0]?.year || 0;
  
  // Generate extended data with the bell curve shape
  const extendedData = useMemo(() => {
    // Find the final values for user portion, swipe portion, and what we want
    const finalData = data[data.length - 1];
    const finalUserPortion = finalData?.userPortion || 0;
    const finalSwipePortion = finalData?.swipePortion || 0;
    const finalWhatWeWant = finalData?.whatWeWant || 0;
    const retirementAge = lastYear;

    // Create extended data with decline after retirement
    const result = [...data];

    // Extend data with the bell curve post-retirement
    // Assuming 95 as maximum age, we'll simulate the decline
    const yearsInRetirement = 95 - retirementAge;
    
    // Create a decay pattern for the retirement phase
    for (let i = 1; i <= yearsInRetirement; i++) {
      const age = retirementAge + i;
      const declineRate = i / yearsInRetirement;
      const declineSquared = Math.pow(declineRate, 1.5); // Non-linear decline for a better curve
      
      const userPortionValue = Math.max(0, Math.floor(finalUserPortion * (1 - declineSquared)));
      const swipePortionValue = Math.max(0, Math.floor(finalSwipePortion * (1 - declineSquared)));
      
      // The "what we want" should typically stay level then decline later
      let whatWeWantValue = finalWhatWeWant;
      if (i > yearsInRetirement / 2) {
        // Start declining after half the retirement period
        const lateDeclineRate = (i - yearsInRetirement / 2) / (yearsInRetirement / 2);
        whatWeWantValue = Math.max(0, Math.floor(finalWhatWeWant * (1 - Math.pow(lateDeclineRate, 1.2))));
      }
      
      result.push({
        year: age,
        userPortion: userPortionValue,
        swipePortion: swipePortionValue,
        whatWeWant: whatWeWantValue
      });
    }
    
    return result;
  }, [data, lastYear]);

  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };  

  interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];  // Replace `any` with a more specific type if available
    label?: string | number;
  }

  // Custom tooltip component
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const totalSavings = (payload[0]?.value || 0) + (payload[1]?.value || 0);
      
      return (
        <div className="bg-white p-4 rounded shadow-lg border border-gray-200">
          <p className="text-gray-700 font-semibold">Age: {label}</p>
          <div className="mt-2">
            <p className="text-green-600 flex items-center">
              <span className="w-3 h-3 inline-block mr-2 bg-green-500 rounded-full"></span>
              Your Savings: {formatCurrency(payload[0]?.value || 0)}
            </p>
            <p className="text-yellow-600 flex items-center">
              <span className="w-3 h-3 inline-block mr-2 bg-yellow-500 rounded-full"></span>
              SwipeSwipe: {formatCurrency(payload[1]?.value || 0)}
            </p>
            <p className="text-indigo-600 flex items-center">
              <span className="w-3 h-3 inline-block mr-2 bg-indigo-500 rounded-full"></span>
              Goal: {formatCurrency(payload[2]?.value || 0)}
            </p>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="font-bold">
                Total Savings: {formatCurrency(totalSavings)}
              </p>
              <p className={totalSavings >= (payload[2]?.value || 0) ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                {totalSavings >= (payload[2]?.value || 0) 
                  ? "On Track! 🎉" 
                  : `Gap: ${formatCurrency((payload[2]?.value || 0) - totalSavings)}`}
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-sm p-4">
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={extendedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="colorUserPortion" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorSwipePortion" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FBC950" stopOpacity={0.7} />
              <stop offset="95%" stopColor="#FBC950" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorWhatWeWant" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          
          <XAxis 
            dataKey="year"
            stroke="#6B7280"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#9CA3AF' }}
            axisLine={{ stroke: '#9CA3AF' }}
            label={{ 
              value: 'Age', 
              position: 'insideBottom', 
              offset: -10,
              fill: '#4B5563', 
              fontSize: 12 
            }}
          />
          
          <YAxis
            stroke="#6B7280"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#9CA3AF' }}
            axisLine={{ stroke: '#9CA3AF' }}
            tickFormatter={(tick) => `$${(tick / 1000).toFixed(0)}k`}
            label={{
              value: 'Savings ($)',
              angle: -90,
              position: 'insideLeft',
              fill: '#4B5563',
              fontSize: 12
            }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend 
            iconType="circle"
            wrapperStyle={{
              paddingTop: 20,
              fontSize: 12
            }}
          />

          {/* User Portion - Your Retirement Savings */}
          <Area
            type="monotone"
            dataKey="userPortion"
            name="Your Savings"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#colorUserPortion)"
            fillOpacity={1}
            stackId="1"
          />

          {/* SwipeSwipe Portion */}
          <Area
            type="monotone"
            dataKey="swipePortion"
            name="SwipeSwipe"
            stroke="#F59E0B"
            strokeWidth={2}
            fill="url(#colorSwipePortion)"
            fillOpacity={1}
            stackId="1"
          />

          {/* What We Want - Target */}
          <Area
            type="monotone"
            dataKey="whatWeWant"
            name="Retirement Goal"
            stroke="#6366F1"
            strokeWidth={2}
            fill="url(#colorWhatWeWant)"
            fillOpacity={0.5}
            strokeDasharray="4 4"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RetirementChart;