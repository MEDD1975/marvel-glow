import { useEffect, useState } from "react";
import { conditions } from "@/lib/conditions";

type Stats = { total: number; byPathology: Array<{ parcoursId: string; count: number }> };

export function ScanStats({ admin = false }: { admin?: boolean }) {
  const [stats, setStats] = useState<Stats & { byDoctor?: Array<{ medecinId: string; count: number }> } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    void fetch(admin ? "/api/admin/scan-stats" : "/api/doctor/scan-stats")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("stats")))
      .then(setStats)
      .catch(() => setError(true));
  }, [admin]);

  if (error) return <p className="text-sm text-muted-foreground">Statistiques indisponibles pour le moment.</p>;
  if (!stats) return <p className="text-sm text-muted-foreground">Chargement des statistiques…</p>;

  return <section className="rounded-2xl border border-border bg-card px-4 py-3 sm:px-5" aria-labelledby={admin ? "global-scan-stats" : "doctor-scan-stats"}>
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
      <h2 id={admin ? "global-scan-stats" : "doctor-scan-stats"} className="text-base font-semibold text-foreground">Suivi anonyme des scans</h2>
      <p className="text-2xl font-semibold leading-none text-care">{stats.total}</p>
      <p className="text-sm text-muted-foreground">scan{stats.total > 1 ? "s" : ""} réalisé{stats.total > 1 ? "s" : ""}</p>
    </div>
    <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
      <h3 className="font-medium text-foreground">Pathologies les plus scannées</h3>
      {stats.byPathology.length ? stats.byPathology.map((item) => <span key={item.parcoursId} className="inline-flex gap-1.5"><span>{conditions.find((condition) => condition.id === item.parcoursId)?.name ?? item.parcoursId}</span><strong className="text-foreground">{item.count}</strong></span>) : <span>Aucun scan enregistré.</span>}
    </div>
    {admin && stats.byDoctor && <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground"><h3 className="font-medium text-foreground">Répartition par médecin</h3>{stats.byDoctor.map((item) => <span key={item.medecinId} className="inline-flex gap-1.5"><span>{item.medecinId}</span><strong className="text-foreground">{item.count}</strong></span>)}</div>}
  </section>;
}
