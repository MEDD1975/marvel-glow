import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ExternalLink, Eye, EyeOff, Pencil, Play, Plus, Search, Trash2 } from "lucide-react";
import { conditions } from "@/lib/conditions";
import {
  findCondition,
  formatDate,
  resourceKind,
  resourceKindLabels,
  selectableResourceKinds,
  type ResourceKind,
} from "@/lib/doctor-pathway-info";
import type { DoctorResourceRecord } from "@/lib/doctor-resource-db";
import { authClient } from "@/lib/auth-client";
import { ConfirmationDialog } from "@/components/doctor/ConfirmationDialog";
import { DoctorHeader, DoctorPage } from "@/components/doctor/DoctorLayout";
import { EmptyState, ErrorState, LoadingState } from "@/components/doctor/states";
import { ResourceFormDialog } from "@/components/doctor/ResourceFormDialog";
import {
  doctorKeys,
  sendJson,
  useDoctorCache,
  useDoctorResources,
} from "@/components/doctor/use-doctor-data";

export const Route = createFileRoute("/cabinet/kine/ressources")({
  head: () => ({ meta: [{ title: "Ma bibliothèque — Kivoir" }] }),
  component: KineResourcesPage,
});

const selectClass =
  "min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

function videoThumbnail(url: string) {
  const match = url.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/))([\w-]{11})/i,
  );
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

function KineResourcesPage() {
  const { data: session } = authClient.useSession();
  const resources = useDoctorResources(session?.user?.id);
  const cache = useDoctorCache();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<ResourceKind | "all">("all");
  const [pathway, setPathway] = useState("all");
  const [status, setStatus] = useState<"all" | "active" | "hidden">("all");
  const [editing, setEditing] = useState<{
    open: boolean;
    resource: DoctorResourceRecord | null;
    key: number;
  }>({ open: false, resource: null, key: 0 });
  const [toDelete, setToDelete] = useState<DoctorResourceRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => cache.invalidateQueries({ queryKey: doctorKeys.resources });
  const openForm = (resource: DoctorResourceRecord | null) =>
    setEditing((current) => ({ open: true, resource, key: current.key + 1 }));

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const priority: Record<string, number> = { video: 0, document: 1, link: 2 };
    return (resources.data ?? [])
      .filter(
        (item) =>
          (kind === "all" || resourceKind(item) === kind) &&
          (pathway === "all" || item.conditionId === pathway) &&
          (status === "all" || item.status === status) &&
          (!needle || item.title.toLowerCase().includes(needle)),
      )
      .sort((a, b) => (priority[resourceKind(a)] ?? 3) - (priority[resourceKind(b)] ?? 3));
  }, [kind, pathway, query, resources.data, status]);

  const toggleVisibility = async (item: DoctorResourceRecord) => {
    setError(null);
    try {
      await sendJson("/api/doctor-resources", "PATCH", {
        id: item.id,
        title: item.title,
        conditionId: item.conditionId,
        source: item.source,
        description: item.description,
        validatedAt: item.validatedAt,
        kind: item.kind,
        status: item.status === "hidden" ? "active" : "hidden",
      });
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "La modification a échoué.");
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setError(null);
    try {
      await sendJson("/api/doctor-resources", "DELETE", { id: toDelete.id });
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "La suppression a échoué.");
    } finally {
      setToDelete(null);
    }
  };

  return (
    <DoctorPage>
      <div className="mb-4">
        <Link to="/cabinet/kine" className="text-sm font-semibold text-[#177e78] hover:underline">
          Retour à l’espace kiné
        </Link>
      </div>
      <DoctorHeader
        title="Ma bibliothèque"
        description="Vos vidéos, documents, photos et liens, organisés par parcours et prêts à être transmis."
        actions={
          <button
            type="button"
            onClick={() => openForm(null)}
            className="flex min-h-11 items-center gap-2 rounded-xl bg-care px-4 text-sm font-semibold text-care-foreground"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Ajouter un contenu
          </button>
        }
      />

      <div className="mt-6 grid grid-cols-1 items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm sm:grid-cols-[minmax(180px,1fr)_repeat(3,220px)]">
        <label className="relative min-w-0">
          <span className="sr-only">Rechercher dans ma bibliothèque</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher"
            className={`${selectClass} pl-9`}
          />
        </label>
        <label>
          <span className="sr-only">Type de contenu</span>
          <select
            value={kind}
            onChange={(event) => setKind(event.target.value as ResourceKind | "all")}
            className={selectClass}
          >
            <option value="all">Tous les types</option>
            {selectableResourceKinds.map((key) => (
              <option key={key} value={key}>
                {resourceKindLabels[key]}
              </option>
            ))}
            {resources.data?.some((item) => resourceKind(item) === "exercise") ? (
              <option value="exercise">{resourceKindLabels.exercise}</option>
            ) : null}
          </select>
        </label>
        <label>
          <span className="sr-only">Parcours</span>
          <select
            value={pathway}
            onChange={(event) => setPathway(event.target.value)}
            className={selectClass}
          >
            <option value="all">Tous les parcours</option>
            {conditions.map((condition) => (
              <option key={condition.id} value={condition.id}>
                {condition.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Statut de visibilité</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as typeof status)}
            className={selectClass}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Visibles</option>
            <option value="hidden">Masqués</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {error ? <ErrorState message={error} /> : null}
        {resources.isPending ? (
          <LoadingState label="Chargement de votre bibliothèque…" />
        ) : resources.isError ? (
          <ErrorState
            message="Impossible de charger votre bibliothèque."
            onRetry={() => void resources.refetch()}
          />
        ) : !resources.data?.length ? (
          <EmptyState
            title="Votre bibliothèque est vide"
            description="Ajoutez une vidéo, un document, une photo ou un lien à transmettre à vos patients."
            action={
              <button
                type="button"
                onClick={() => openForm(null)}
                className="min-h-11 rounded-xl bg-care px-4 text-sm font-semibold text-care-foreground"
              >
                Ajouter mon premier contenu
              </button>
            }
          />
        ) : !filtered.length ? (
          <EmptyState
            title="Aucun résultat"
            description="Modifiez vos filtres pour afficher d’autres contenus."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {filtered.map((item) => {
              const hidden = item.status === "hidden";
              const isVideo =
                resourceKind(item) === "video" || item.contentType?.startsWith("video/");
              const thumbnail = isVideo ? videoThumbnail(item.url) : null;
              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm md:flex-row md:items-center"
                >
                  {isVideo ? (
                    <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-muted md:w-36">
                      {thumbnail ? (
                        <img src={thumbnail} alt="" className="h-full w-full object-cover" />
                      ) : null}
                      <span className="absolute inset-0 flex items-center justify-center bg-black/15">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-care shadow-sm">
                          <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" />
                        </span>
                      </span>
                    </div>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-care/10 px-2 py-0.5 text-xs font-medium text-care">
                        {resourceKindLabels[resourceKind(item)]}
                      </span>
                      {hidden ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          Masqué
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {findCondition(item.conditionId)?.name ?? "Parcours inconnu"}
                      {item.validatedAt ? ` · Validée le ${formatDate(item.validatedAt)}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Ouvrir ${item.title}`}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-border hover:bg-muted"
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                    <button
                      type="button"
                      onClick={() => openForm(item)}
                      aria-label={`Modifier ${item.title}`}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-border hover:bg-muted"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void toggleVisibility(item)}
                      aria-label={hidden ? `Afficher ${item.title}` : `Masquer ${item.title}`}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-border hover:bg-muted"
                    >
                      {hidden ? (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setToDelete(item)}
                      aria-label={`Supprimer ${item.title}`}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-destructive hover:bg-destructive/5"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ResourceFormDialog
        key={editing.key}
        open={editing.open}
        onOpenChange={(open) => setEditing((current) => ({ ...current, open }))}
        resource={editing.resource}
        onSaved={refresh}
        defaultSource="Partagé par le kinésithérapeute"
      />
      <ConfirmationDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Supprimer ce contenu ?"
        description={`« ${toDelete?.title ?? ""} » ne sera plus accessible aux patients.`}
        onConfirm={() => void confirmDelete()}
      />
    </DoctorPage>
  );
}
