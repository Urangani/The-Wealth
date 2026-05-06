import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

interface SparklineChartProps {
  data: any[];
  dataKey: string;
  color?: string;
  height?: number;
}

export function SparklineChart({ data, dataKey, color = "#10b981", height = 60 }: SparklineChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center text-xs text-gray-500" style={{ height }}>No data</div>;
  }

  return (
    <div style={{ height, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip 
            contentStyle={{ backgroundColor: "#111827", borderColor: "#374151", borderRadius: "0.5rem", fontSize: "0.875rem" }}
            itemStyle={{ color: "#f3f4f6" }}
            labelStyle={{ display: "none" }}
            formatter={(value: ValueType | undefined) => [value ? Number(value).toFixed(2) : "0.00", "Value"]}
          />
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            fillOpacity={1} 
            fill={`url(#color-${dataKey})`} 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
