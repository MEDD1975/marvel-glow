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

  return <section className="rounded-2xl border border-border bg-card p-5" aria-labelledby={admin ? "global-scan-stats" : "doctor-scan-stats"}>
    <h2 id={admin ? "global-scan-stats" : "doctor-scan-stats"} className="text-lg font-semibold text-foreground">Suivi anonyme des scans</h2>
    <p className="mt-2 text-3xl font-semibold text-care">{stats.total}</p>
    <p className="text-sm text-muted-foreground">scan{stats.total > 1 ? "s" : ""} réalisé{stats.total > 1 ? "s" : ""}</p>
    <h3 className="mt-5 font-medium text-foreground">Pathologies les plus scannées</h3>
    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
      {stats.byPathology.length ? stats.byPathology.map((item) => <li key={item.parcoursId} className="flex justify-between gap-4"><span>{conditions.find((condition) => condition.id === item.parcoursId)?.name ?? item.parcoursId}</span><strong>{item.count}</strong></li>) : <li>Aucun scan enregistré.</li>}
    </ul>
    {admin && stats.byDoctor && <><h3 className="mt-5 font-medium text-foreground">Répartition par médecin</h3><ul className="mt-2 space-y-1 text-sm text-muted-foreground">{stats.byDoctor.map((item) => <li key={item.medecinId} className="flex justify-between gap-4"><span>{item.medecinId}</span><strong>{item.count}</strong></li>)}</ul></>}
  </section>;
}
