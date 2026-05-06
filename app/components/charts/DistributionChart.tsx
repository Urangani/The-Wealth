import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface DistributionChartProps {
  data: any[];
  nameKey: string;
  dataKey: string;
  height?: number;
  colors?: string[];
}

export function DistributionChart({ 
  data, 
  nameKey, 
  dataKey, 
  height = 250,
  colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"]
}: DistributionChartProps) {
  
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center text-sm text-gray-500" style={{ height }}>No data available</div>;
  }

  return (
    <div style={{ height, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: "#111827", borderColor: "#374151", borderRadius: "0.5rem", fontSize: "0.875rem" }}
            itemStyle={{ color: "#f3f4f6" }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
