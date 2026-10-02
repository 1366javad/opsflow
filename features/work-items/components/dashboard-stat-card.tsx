type DashboardStatCardProps = {
  label: string;
  value: number;
  tone?: "neutral" | "blue" | "green" | "rose";
};

const toneStyles = {
  neutral: "bg-slate-400",
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  rose: "bg-rose-500",
};

export function DashboardStatCard({ label, value, tone = "neutral" }: DashboardStatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-4 h-2 w-10 rounded-full ${toneStyles[tone]}`} aria-hidden="true" />
      <p className="text-3xl font-semibold tabular-nums tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{label}</p>
    </div>
  );
}
