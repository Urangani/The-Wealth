export default function Logs() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Automation Logs</h1>

      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 text-sm">
        <p>[12:01] Order placed (EURUSD)</p>
        <p>[12:05] SL hit</p>
      </div>
    </div>
  );
}