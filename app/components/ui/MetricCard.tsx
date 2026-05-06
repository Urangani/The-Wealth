import React from "react";

interface MetricCardProps {
  title: string;
  value: React.ReactNode;
  trend?: {
    value: number | string;
    isPositive: boolean;
    label?: string;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({ title, value, trend, icon, className = "" }: MetricCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-gray-900/40 backdrop-blur-md border border-white/5 p-5 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:bg-gray-900/60 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 tracking-wide uppercase">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-white">{value}</h3>
          </div>
          
          {trend && (
            <div className="mt-2 flex items-center gap-1.5 text-sm">
              <span
                className={`font-medium ${
                  trend.isPositive ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {trend.isPositive ? "+" : "-"}{trend.value}
              </span>
              {trend.label && <span className="text-gray-500">{trend.label}</span>}
            </div>
          )}
        </div>
        
        {icon && (
          <div className="rounded-xl bg-white/5 p-2.5 text-gray-300 ring-1 ring-inset ring-white/10 transition-colors duration-300 group-hover:bg-white/10 group-hover:text-white">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
