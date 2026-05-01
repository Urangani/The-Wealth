export default function Risk() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Risk Dashboard</h1>

      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
        <p className="text-gray-400 text-sm">Total Exposure</p>
        <p className="text-xl font-bold text-yellow-400">3.5%</p>
      </div>

      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
        <p className="text-gray-400 text-sm">Max Daily Loss</p>
        <p className="text-xl font-bold text-red-400">-2%</p>
      </div>
    </div>
  );
}