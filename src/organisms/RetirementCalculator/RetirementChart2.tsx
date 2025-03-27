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
  ReferenceLine,
} from "recharts";
import { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

/** Same shape as your normal chart data */
interface ChartItem {
  year: number;
  userPortion: number;
  swipePortion: number;
  whatWeWant: number;
}

interface Props {
  data: ChartItem[];
  tooltip?: React.ReactElement;
}

const RetirementChart: React.FC<Props> = ({ data, tooltip }) => {
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
      // More realistic decay factor - exponential decline
      const factor = Math.pow(i / yearsInRetirement, 1.5);
      
      const userVal = Math.floor(finalUser * (1 - factor * 0.8));
      const swipeVal = Math.floor(finalSwipe * (1 - factor * 0.8));
      
      result.push({
        year: age,
        userPortion: Math.max(0, userVal),
        swipePortion: Math.max(0, swipeVal),
        whatWeWant: finalWant, // Keep the goal flat
      });
    }
    return result;
  }, [data, lastYear]);
  
  // Calculate the maximum value for Y-axis domain
  const maxYValue = useMemo(() => {
    let max = 0;
    extendedData.forEach(item => {
      const total = item.userPortion + item.swipePortion;
      max = Math.max(max, total, item.whatWeWant);
    });
    // Add a 10% buffer for better display
    return Math.ceil(max * 1.1);
  }, [extendedData]);
  
  // Format large Y axis values - use K for thousands, M for millions
  const formatYAxis = (value: number) => {
    if (value === 0) return '0';
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };
  
  return (
    <ResponsiveContainer width="100%" height={380}>
      <AreaChart
        data={extendedData}
        margin={{ top: 5, right: 30, left: 10, bottom: 15 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="year" 
          label={{ value: 'Age', position: 'insideBottomRight', offset: -10 }}
          padding={{ left: 20, right: 20 }}
        />
        <YAxis 
          tickFormatter={formatYAxis}
          label={{ value: 'Amount', angle: -90, position: 'insideLeft', offset: 15 }}
          width={90}
          tickMargin={15}
          domain={[0, maxYValue]}
          tickCount={6}
        />
        <Tooltip content={tooltip as any} />
        <Legend wrapperStyle={{ paddingTop: 10 }} />
        
        {/* Reference line at retirement age */}
        <ReferenceLine 
          x={lastYear} 
          stroke="#666" 
          strokeDasharray="3 3" 
          label={{ 
            value: 'Retirement', 
            position: 'top',
            fill: '#666',
            fontSize: 12
          }}
        />
        
        <Area
          type="monotone"
          dataKey="whatWeWant"
          name="Goal"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.2}
          activeDot={{ r: 8 }}
          isAnimationActive={false}
          strokeDasharray="5 5"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="userPortion"
          name="Your Savings"
          stroke="#42b72a"
          fill="#42b72a"
          fillOpacity={0.6}
          activeDot={{ r: 8 }}
          isAnimationActive={false}
          stackId="1"
        />
        <Area
          type="monotone"
          dataKey="swipePortion"
          name="SwipeSwipe"
          stroke="#ff9933"
          fill="#ff9933"
          fillOpacity={0.6}
          activeDot={{ r: 8 }}
          isAnimationActive={false}
          stackId="1"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default RetirementChart;