export default function DashboardPage() {
  const stats = [
    { label: "Products", value: "128" },
    { label: "Orders", value: "42" },
    { label: "Customers", value: "19" },
    { label: "Revenue", value: "$18.4k" },
  ];

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
          >
            <p className="text-[12px] font-medium text-[color:var(--color-subtext)]">
              {stat.label}
            </p>
            <p className="mt-3 text-[28px] font-black text-[color:var(--color-maintext)]">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <h2 className="text-[16px] font-bold text-[color:var(--color-maintext)]">
            Dashboard overview
          </h2>
          <div className="mt-4 h-[320px] rounded-[16px] border border-dashed border-[#D1D5DB] bg-[#F8FAFC]" />
        </div>

        <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <h2 className="text-[16px] font-bold text-[color:var(--color-maintext)]">
            Recent activity
          </h2>
          <div className="mt-4 space-y-4">
            {[
              "New order created",
              "Customer registered",
              "Product updated",
              "Coupon code used",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 text-[14px] text-[color:var(--color-maintext)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
