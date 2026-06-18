type StatCardProps = {
  title: string;
  value: string | number;
  hint?: string;
};

export function StatCard({ title, value, hint }: StatCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <h3 className="mb-4 text-sm font-medium text-gray-600">{title}</h3>
      <p className="text-2xl font-semibold text-blue-600">{value}</p>
      {hint ? <p className="mt-1 text-xs text-gray-400">{hint}</p> : null}
    </div>
  );
}
