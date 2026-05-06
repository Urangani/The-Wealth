import React from "react";

interface SectionCardProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className = "",
  bodyClassName = "p-5"
}: SectionCardProps) {
  return (
    <div className={`rounded-2xl border border-white/5 bg-gray-900/40 backdrop-blur-md shadow-xl ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <div>
            {title && <h2 className="text-lg font-semibold text-gray-100 tracking-tight">{title}</h2>}
            {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
          </div>
          {action && <div className="ml-4 flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>
        {children}
      </div>
    </div>
  );
}
