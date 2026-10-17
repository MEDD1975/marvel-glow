import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, QrCode } from "lucide-react";
import { conditions } from "@/lib/conditions";
import { formatDate, getPathwayStats, openPatientPreview } from "@/lib/doctor-pathway-info";
import { DoctorHeader, DoctorPage } from "@/components/doctor/DoctorLayout";
import { ErrorState, LoadingState } from "@/components/doctor/states";
import { doctorKeys, sendJson, useCabinetRef, useDoctorCache, useDoctorResources, usePathwaySettings } from "@/components/doctor/use-doctor-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cabinet/parcours")({
  head: () => ({ meta: [{ title: "Mes parcours TMS — Kivoir" }] }),
  component: PathwaysPage,
});

function PathwaysPage() {
  const cabinetRef = useCabinetRef();
  const doctorIdentity = cabinetRef.data ? { id: cabinetRef.data.ref } : null;
  const resources = useDoctorResources();
  const settings = usePathwaySettings();
  const cache = useDoctorCache();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hidden = new Set((settings.data ?? []).filter((item) => item.hidden).map((item) => item.conditionId));

  const toggle = async (conditionId: string) => {
    setPending(conditionId);
    setError(null);
    try {
      await sendJson("/api/doctor-pathways", "PUT", { conditionId, hidden: !hidden.has(conditionId) });
      await cache.invalidateQueries({ queryKey: doctorKeys.pathways });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "La modification a échoué.");
    } finally {
      setPending(null);
    }
  };

  return (
    <DoctorPage>
      <DoctorHeader title="Mes parcours TMS" description="Consultez le contenu de chaque parcours et choisissez ceux proposés lors de la transmission." />
      <div className="mt-6 flex flex-col gap-3">
        {error ? <ErrorState message={error} /> : null}
        {settings.isPending || resources.isPending ? (
          <LoadingState label="Chargement des parcours…" />
        ) : settings.isError || resources.isError ? (
          <ErrorState message="Impossible de charger vos parcours." onRetry={() => { void settings.refetch(); void resources.refetch(); }} />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {conditions.map((condition) => {
              const stats = getPathwayStats(condition.id, resources.data ?? []);
              const isHidden = hidden.has(condition.id);
              return (
                <li key={condition.id} className={cn("flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm", isHidden ? "border-dashed border-border opacity-75" : "border-border")}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">{condition.zone}</p>
                      <h2 className="font-semibold text-foreground">{condition.name}</h2>
                    </div>
                    <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-medium", isHidden ? "bg-muted text-muted-foreground" : "bg-emerald-50 text-emerald-800")}>
                      {isHidden ? "Masqué" : "Proposé"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {stats.recommendations} recommandations · {stats.warnings} signes · {stats.documents} documents · {stats.videos} vidéos
                  </p>
                  <p className="text-xs text-muted-foreground">Dernière validation : {formatDate(stats.lastValidatedAt) ?? "non renseignée"}</p>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <Link to="/cabinet" search={{ pathway: condition.id } as never} className="flex min-h-11 items-center gap-2 rounded-xl bg-care px-4 text-sm font-semibold text-care-foreground">
                      <QrCode className="h-4 w-4" aria-hidden="true" />Transmettre
                    </Link>
                    <button type="button" onClick={() => openPatientPreview(condition.id, doctorIdentity)} className="flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium">
                      <Eye className="h-4 w-4" aria-hidden="true" />Prévisualiser
                    </button>
                    <button type="button" disabled={pending === condition.id} onClick={() => void toggle(condition.id)} className="flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium disabled:opacity-50">
                      {isHidden ? <Eye className="h-4 w-4" aria-hidden="true" /> : <EyeOff className="h-4 w-4" aria-hidden="true" />}
                      {isHidden ? "Proposer" : "Masquer"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DoctorPage>
  );
}
