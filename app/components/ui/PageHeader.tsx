import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className="bg-gradient-to-br from-white to-gray-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-lg text-gray-400 max-w-2xl">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex w-full flex-shrink-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          {actions}
        </div>
      )}
    </div>
  );
}
