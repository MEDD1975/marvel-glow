import { formatDate, type PathwayStats } from "@/lib/doctor-pathway-info";

export function PathwaySummary({ stats }: { stats: PathwayStats }) {
  const rows = [
    { label: "Recommandations", value: stats.recommendations },
    { label: "Signes à surveiller", value: stats.warnings },
    { label: "Documents", value: stats.documents },
    { label: "Vidéos", value: stats.videos },
  ];
  return (
    <section aria-labelledby="pathway-summary-title" className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <h2 id="pathway-summary-title" className="text-sm font-semibold text-foreground">Le patient recevra</h2>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-2 border-b border-border/60 pb-1.5">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="font-semibold tabular-nums text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-muted-foreground">
        Dernière validation : <span className="font-medium text-foreground">{formatDate(stats.lastValidatedAt) ?? "non renseignée"}</span>
      </p>
    </section>
  );
}
