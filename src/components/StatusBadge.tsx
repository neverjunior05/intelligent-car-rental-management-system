const colors: Record<string, string> = {
  available: "bg-green-500/15 text-green-500",
  reserved: "bg-orange/15 text-orange",
  rented: "bg-blue-500/15 text-blue-500",
  returned: "bg-purple-500/15 text-purple-500",
  maintenance: "bg-red-500/15 text-red-500",
  pending: "bg-orange/15 text-orange",
  confirmed: "bg-blue-500/15 text-blue-500",
  active: "bg-green-500/15 text-green-500",
  completed: "bg-slate-500/20 text-soft",
  cancelled: "bg-red-500/15 text-red-500",
  scheduled: "bg-orange/15 text-orange",
  in_progress: "bg-blue-500/15 text-blue-500",
  customer: "bg-blue-500/15 text-blue-500",
  staff: "bg-orange/15 text-orange",
  admin: "bg-black/10 text-app dark:bg-white/10",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
        colors[status] ?? "bg-soft text-soft"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
