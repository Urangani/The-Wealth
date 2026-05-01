export default function Journal() {
  const trades = [
    { pair: "EURUSD", entry: 1.08, exit: 1.09, pl: 100 },
    { pair: "GBPUSD", entry: 1.25, exit: 1.24, pl: -80 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Trade Journal</h1>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          placeholder="Search pair..."
          className="bg-gray-900 border border-gray-800 px-3 py-2 rounded-lg text-sm"
        />
        <button className="bg-blue-600 px-4 py-2 rounded-lg text-sm">
          Add Trade
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-gray-400 bg-gray-950">
            <tr>
              <th className="p-3 text-left">Pair</th>
              <th className="p-3 text-left">Entry</th>
              <th className="p-3 text-left">Exit</th>
              <th className="p-3 text-left">P/L</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t, i) => (
              <tr key={i} className="border-t border-gray-800">
                <td className="p-3">{t.pair}</td>
                <td className="p-3">{t.entry}</td>
                <td className="p-3">{t.exit}</td>
                <td
                  className={`p-3 ${
                    t.pl > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {t.pl}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}