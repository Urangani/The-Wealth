
export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card title="Balance" value="$10,000" />
        <Card title="Equity" value="$10,250" />
        <Card title="Daily P/L" value="+$250" positive />
      </div>

      {/* Open Trades */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <h2 className="mb-3 font-medium">Open Positions</h2>

        <table className="w-full text-sm">
          <thead className="text-gray-400">
            <tr>
              <th className="text-left p-2">Pair</th>
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Lot</th>
              <th className="text-left p-2">P/L</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-800">
              <td className="p-2">EURUSD</td>
              <td className="p-2 text-green-400">Buy</td>
              <td className="p-2">0.10</td>
              <td className="p-2 text-green-400">+120</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  positive,
}: {
  title: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
      <p className="text-sm text-gray-400">{title}</p>
      <p
        className={`text-xl font-bold ${
          positive ? "text-green-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}