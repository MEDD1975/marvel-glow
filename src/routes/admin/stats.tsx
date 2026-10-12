import { createFileRoute } from "@tanstack/react-router";
import { ScanStats } from "@/components/ScanStats";

export const Route = createFileRoute("/admin/stats")({
  head: () => ({ meta: [{ title: "Statistiques globales — Kivoir" }] }),
  component: AdminStatsPage,
});

function AdminStatsPage() {
  return <main className="mx-auto max-w-5xl px-4 py-12"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-care">Administration</p><h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">Utilisation globale</h1><p className="mt-3 text-muted-foreground">Données agrégées, sans adresse IP, cookie ni identifiant patient.</p><div className="mt-8"><ScanStats admin /></div></main>;
}
