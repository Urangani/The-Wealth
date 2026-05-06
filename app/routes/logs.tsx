import { useEffect, useState } from "react";
import { PageHeader, SectionCard, StatePanel, DataTable } from "../components/ui";
import type { Column } from "../components/ui";
import { fetchApi } from "../services/api";

interface LogItem {
  time: string;
  event: string;
  severity?: "INFO" | "WARN" | "ERROR";
}

export default function Logs() {
  const [items, setItems] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    fetchApi<LogItem[]>("logs")
      .then((res) => {
        setItems(res || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns: Column<LogItem>[] = [
    { key: "time", header: "Timestamp", sortable: true, cell: (l) => <span className="text-gray-500 font-mono">{l.time}</span> },
    { key: "event", header: "Event", cell: (l) => <span className="text-gray-200">{l.event}</span> },
    { 
      key: "severity", 
      header: "Severity", 
      sortable: true,
      cell: (l) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          l.severity === "ERROR" ? "bg-rose-500/20 text-rose-400" :
          l.severity === "WARN" ? "bg-amber-500/20 text-amber-400" :
          "bg-blue-500/20 text-blue-400"
        }`}>
          {l.severity || "INFO"}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="System Logs" description="Real-time execution events and automation history." />

      <SectionCard bodyClassName="p-0">
        <StatePanel isLoading={loading} error={error} onRetry={loadData} emptyTitle="No logs recorded">
          <DataTable data={items} columns={columns} keyExtractor={(l: LogItem, idx: number) => idx} />
        </StatePanel>
      </SectionCard>
    </div>
  );
}