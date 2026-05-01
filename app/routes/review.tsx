export default function Review() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Weekly Review</h1>

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Trades" value="25" />
        <Stat label="Win Rate" value="60%" />
        <Stat label="Net P/L" value="+$420" />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}