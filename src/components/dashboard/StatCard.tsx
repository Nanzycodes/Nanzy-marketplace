interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "good" | "warn" | "bad";
}

const tones = {
  default: "bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800",
  good: "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900",
  warn: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900",
  bad: "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900",
};

export default function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: StatCardProps) {
  return (
    <div className={`rounded-xl border p-5 ${tones[tone]}`}>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
      {hint && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      )}
    </div>
  );
}
