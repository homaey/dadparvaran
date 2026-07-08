export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded-xl" />
      <div className="h-4 w-64 bg-gray-100 rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 h-28" />
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 h-64" />
    </div>
  );
}
