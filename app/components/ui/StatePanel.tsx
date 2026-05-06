import React from "react";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

interface StatePanelProps {
  isLoading: boolean;
  error?: string | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  children: React.ReactNode;
}

export function StatePanel({
  isLoading,
  error,
  isEmpty,
  onRetry,
  emptyTitle = "No data available",
  emptyDescription,
  children,
}: StatePanelProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-white/5 bg-gray-900/20 backdrop-blur-md">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-500 border-t-white"></div>
        <p className="mt-4 text-sm font-medium text-gray-400 tracking-wide animate-pulse">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (isEmpty) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return <>{children}</>;
}
