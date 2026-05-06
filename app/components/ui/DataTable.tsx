import React, { useState, useMemo } from "react";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
  sortable?: boolean;
  sortValue?: (row: T) => string | number; // Required if sortable is true and cell returns complex nodes or isn't a direct key mapping
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T, index: number) => string | number;
  emptyState?: React.ReactNode;
}

export function DataTable<T>({ data, columns, keyExtractor, emptyState }: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    
    const column = columns.find((c) => c.key === sortConfig.key);
    if (!column || !column.sortable) return data;

    return [...data].sort((a, b) => {
      let aVal = column.sortValue ? column.sortValue(a) : (a as any)[column.key];
      let bVal = column.sortValue ? column.sortValue(b) : (b as any)[column.key];
      
      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      return sortConfig.direction === "asc" ? 1 : -1;
    });
  }, [data, sortConfig, columns]);

  if (!data || data.length === 0) {
    return emptyState ? <>{emptyState}</> : null;
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-white/5 bg-black/20">
      <table className="w-full whitespace-nowrap text-left text-sm">
        <thead className="bg-white/5 text-gray-400 backdrop-blur-md">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-3 font-medium ${
                  col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                } ${col.className || ""} ${col.sortable ? "cursor-pointer select-none hover:text-white transition-colors" : ""}`}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className={`flex items-center gap-1.5 ${col.align === "right" ? "justify-end" : col.align === "center" ? "justify-center" : "justify-start"}`}>
                  {col.header}
                  {col.sortable && (
                    <span className="flex flex-col text-[10px] leading-none opacity-50">
                      <span className={sortConfig?.key === col.key && sortConfig.direction === "asc" ? "text-emerald-400 opacity-100" : ""}>▲</span>
                      <span className={sortConfig?.key === col.key && sortConfig.direction === "desc" ? "text-emerald-400 opacity-100" : ""}>▼</span>
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {sortedData.map((row, index) => (
            <tr
              key={keyExtractor(row, index)}
              className="transition-colors duration-200 hover:bg-white/[0.02]"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 ${
                    col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                  } ${col.className || ""}`}
                >
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
