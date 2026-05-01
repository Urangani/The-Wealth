export default function Strategies() {
  const strategies = [
    { name: "London Breakout", enabled: true },
    { name: "NY Reversal", enabled: false },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Strategies</h1>

      <div className="space-y-3">
        {strategies.map((s, i) => (
          <div
            key={i}
            className="flex justify-between items-center bg-gray-900 p-4 rounded-xl border border-gray-800"
          >
            <span>{s.name}</span>
            <button
              className={`px-3 py-1 rounded ${
                s.enabled ? "bg-green-600" : "bg-gray-700"
              }`}
            >
              {s.enabled ? "ON" : "OFF"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}