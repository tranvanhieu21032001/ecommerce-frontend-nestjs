export function DashboardStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="min-w-[92px] rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
      <p className="text-[11px] font-semibold text-[#7C8794]">{label}</p>
      <p className="mt-1 text-[22px] font-black text-[color:var(--color-maintext)]">
        {value}
      </p>
    </div>
  );
}
