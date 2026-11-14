import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Link2,
  Music2,
  Pencil,
  Play,
  Plus,
  Search,
  Trash2,
  Video,
} from "lucide-react";
import { conditions } from "@/lib/conditions";
import {
  findCondition,
  formatDate,
  resourceKind,
  resourceKindLabels,
  type ResourceKind,
} from "@/lib/doctor-pathway-info";
import type { DoctorResourceRecord } from "@/lib/doctor-resource-db";
import { authClient } from "@/lib/auth-client";
import { ConfirmationDialog } from "@/components/doctor/ConfirmationDialog";
import { ErrorState, LoadingState } from "@/components/doctor/states";
import { ResourceFormDialog } from "@/components/doctor/ResourceFormDialog";
import {
  doctorKeys,
  sendJson,
  useDoctorCache,
  useDoctorResources,
} from "@/components/doctor/use-doctor-data";

export const Route = createFileRoute("/cabinet/kine/ressources")({
  head: () => ({ meta: [{ title: "Ma bibliothèque kiné — Kivoir" }] }),
  component: KineResourcesPage,
});

const contentFilters: Array<{ value: ResourceKind | "all"; label: string }> = [
  { value: "all", label: "Tout" },
  { value: "video", label: "Vidéos" },
  { value: "document", label: "Documents" },
  { value: "photo", label: "Photos" },
  { value: "audio", label: "Audio" },
  { value: "link", label: "Liens" },
];

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
    return (resources.data ?? []).filter((item) => {
      const matchesKind = kind === "all" || resourceKind(item) === kind;
      const matchesQuery =
        !needle ||
        item.title.toLowerCase().includes(needle) ||
        (item.description ?? "").toLowerCase().includes(needle);
      return matchesKind && matchesQuery;
    });
  }, [kind, query, resources.data]);

  const totals = useMemo(() => {
    const items = resources.data ?? [];
    return {
      total: items.length,
      videos: items.filter((item) => resourceKind(item) === "video").length,
      files: items.filter((item) => ["document", "photo"].includes(resourceKind(item))).length,
      audios: items.filter((item) => resourceKind(item) === "audio").length,
      links: items.filter((item) => resourceKind(item) === "link").length,
    };
  }, [resources.data]);

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
    <main className="min-h-screen bg-[#f7faf7]">
      <div className="mx-auto flex max-w-7xl flex-col gap-7 px-4 py-5 md:gap-9 md:px-8 md:py-8">
        <Link
          to="/cabinet/kine"
          className="inline-flex min-h-10 w-fit items-center gap-2 rounded-full border border-[#d7e6dc] bg-white px-4 text-sm font-semibold text-[#176b5b] transition hover:bg-[#edf6ef]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour à l’espace kiné
        </Link>

        <header className="overflow-hidden rounded-[2rem] border border-[#cfe2d5] bg-[#eaf4ed]">
          <div className="grid gap-8 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-9">
            <div className="flex flex-col items-start justify-center">
              <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#176b5b]">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Espace kinésithérapeute
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#19392f] md:text-4xl">
                Ma bibliothèque de soins
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#49685d] md:text-base">
                Rassemblez les supports que vous utilisez en séance et retrouvez-les facilement pour
                les partager avec vos patients.
              </p>
              <button
                type="button"
                onClick={() => openForm(null)}
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#177e78] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#126b66] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#177e78] focus-visible:ring-offset-2"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Ajouter une ressource
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 self-end md:self-center">
              <div className="col-span-2 rounded-2xl bg-[#176b5b] p-4 text-white md:p-5">
                <p className="text-sm font-medium text-white/75">
                  Contenus dans votre bibliothèque
                </p>
                <p className="mt-2 text-4xl font-bold tabular-nums">{totals.total}</p>
              </div>
              <div className="rounded-2xl border border-[#cfe2d5] bg-white/85 p-4">
                <Video className="h-5 w-5 text-[#177e78]" aria-hidden="true" />
                <p className="mt-3 text-2xl font-bold tabular-nums text-[#19392f]">
                  {totals.videos}
                </p>
                <p className="text-xs font-medium text-[#587269]">Vidéos</p>
              </div>
              <div className="rounded-2xl border border-[#cfe2d5] bg-white/85 p-4">
                <FileText className="h-5 w-5 text-[#177e78]" aria-hidden="true" />
                <p className="mt-3 text-2xl font-bold tabular-nums text-[#19392f]">
                  {totals.files}
                </p>
                <p className="text-xs font-medium text-[#587269]">Documents & photos</p>
              </div>
              <div className="rounded-2xl border border-[#cfe2d5] bg-white/85 p-4">
                <Music2 className="h-5 w-5 text-[#177e78]" aria-hidden="true" />
                <p className="mt-3 text-2xl font-bold tabular-nums text-[#19392f]">
                  {totals.audios}
                </p>
                <p className="text-xs font-medium text-[#587269]">Audios</p>
              </div>
              <div className="rounded-2xl border border-[#cfe2d5] bg-white/85 p-4">
                <Link2 className="h-5 w-5 text-[#177e78]" aria-hidden="true" />
                <p className="mt-3 text-2xl font-bold tabular-nums text-[#19392f]">
                  {totals.links}
                </p>
                <p className="text-xs font-medium text-[#587269]">Liens</p>
              </div>
            </div>
          </div>
        </header>

        <section aria-labelledby="library-items-heading">
          <div className="flex flex-col gap-4 border-b border-[#dbe7df] pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#177e78]">
                Vos supports
              </p>
              <h2 id="library-items-heading" className="mt-1 text-2xl font-bold text-[#19392f]">
                Contenus enregistrés
              </h2>
            </div>
            <label className="relative w-full md:max-w-xs">
              <span className="sr-only">Rechercher dans ma bibliothèque</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#668075]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher un contenu"
                className="min-h-11 w-full rounded-xl border border-[#d4e2d9] bg-white pl-9 pr-3 text-sm text-[#19392f] outline-none transition placeholder:text-[#7d9389] focus:border-[#177e78] focus:ring-2 focus:ring-[#177e78]/15"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-2" aria-label="Filtrer par type de contenu">
            {contentFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                aria-pressed={kind === filter.value}
                onClick={() => setKind(filter.value)}
                className={`min-h-10 rounded-full border px-4 text-sm font-semibold transition ${
                  kind === filter.value
                    ? "border-[#176b5b] bg-[#176b5b] text-white"
                    : "border-[#d4e2d9] bg-white text-[#49685d] hover:border-[#177e78] hover:text-[#176b5b]"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="mt-5">
            {error ? <ErrorState message={error} /> : null}
            {resources.isPending ? (
              <LoadingState label="Chargement de votre bibliothèque…" />
            ) : resources.isError ? (
              <ErrorState
                message="Impossible de charger votre bibliothèque."
                onRetry={() => void resources.refetch()}
              />
            ) : !resources.data?.length ? (
              <div className="rounded-3xl border border-dashed border-[#c6dace] bg-white px-6 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf4ed] text-[#177e78]">
                  <BookOpen className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#19392f]">
                  Votre bibliothèque est vide
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#668075]">
                  Ajoutez une vidéo, un document, une photo, un fichier audio ou un lien pour le
                  retrouver ici lors de vos prochaines séances.
                </p>
                <button
                  type="button"
                  onClick={() => openForm(null)}
                  className="mt-5 min-h-11 rounded-xl bg-[#177e78] px-5 text-sm font-semibold text-white hover:bg-[#126b66]"
                >
                  Ajouter mon premier contenu
                </button>
              </div>
            ) : !filtered.length ? (
              <div className="rounded-2xl border border-[#d4e2d9] bg-white px-5 py-8 text-center text-sm text-[#668075]">
                Aucun contenu ne correspond à cette recherche.
              </div>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((item) => {
                  const itemKind = resourceKind(item);
                  const isVideo = itemKind === "video" || item.contentType?.startsWith("video/");
                  const isPhoto = itemKind === "photo" || item.contentType?.startsWith("image/");
                  const isAudio = itemKind === "audio" || item.contentType?.startsWith("audio/");
                  const thumbnail = isVideo ? videoThumbnail(item.url) : null;
                  const hidden = item.status === "hidden";
                  return (
                    <li
                      key={item.id}
                      className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#dce8df] bg-white shadow-[0_8px_24px_rgba(25,57,47,0.04)] transition hover:-translate-y-0.5 hover:border-[#a8cbb6] hover:shadow-[0_14px_30px_rgba(25,57,47,0.08)]"
                    >
                      <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-[#edf5ef]">
                        {isPhoto ? (
                          <img src={item.url} alt="" className="h-full w-full object-cover" />
                        ) : thumbnail ? (
                          <img src={thumbnail} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#177e78] shadow-sm">
                            {isVideo ? (
                              <Play className="ml-0.5 h-6 w-6 fill-current" aria-hidden="true" />
                            ) : isAudio ? (
                              <Music2 className="h-6 w-6" aria-hidden="true" />
                            ) : itemKind === "link" ? (
                              <Link2 className="h-6 w-6" aria-hidden="true" />
                            ) : (
                              <FileText className="h-6 w-6" aria-hidden="true" />
                            )}
                          </div>
                        )}
                        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#176b5b] shadow-sm">
                          {resourceKindLabels[itemKind]}
                        </span>
                        {hidden ? (
                          <span className="absolute right-3 top-3 rounded-full bg-[#19392f]/85 px-3 py-1 text-xs font-semibold text-white">
                            Masqué
                          </span>
                        ) : null}
                      </div>

                      <div className="flex flex-1 flex-col p-4">
                        <p className="text-xs font-medium text-[#668075]">
                          {findCondition(item.conditionId)?.name ?? "Parcours inconnu"}
                          {item.validatedAt ? ` · Validé le ${formatDate(item.validatedAt)}` : ""}
                        </p>
                        <h3 className="mt-1 line-clamp-2 text-base font-bold text-[#19392f]">
                          {item.title}
                        </h3>
                        {item.description ? (
                          <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#668075]">
                            {item.description}
                          </p>
                        ) : null}
                        <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#edf2ee] pt-3">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Ouvrir ${item.title}`}
                            className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-[#176b5b] hover:bg-[#edf6ef]"
                          >
                            <ExternalLink className="h-4 w-4" aria-hidden="true" />
                            Ouvrir
                          </a>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => openForm(item)}
                              aria-label={`Modifier ${item.title}`}
                              className="flex h-10 w-10 items-center justify-center rounded-lg text-[#49685d] hover:bg-[#edf6ef] hover:text-[#176b5b]"
                            >
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void toggleVisibility(item)}
                              aria-label={
                                hidden ? `Afficher ${item.title}` : `Masquer ${item.title}`
                              }
                              className="flex h-10 w-10 items-center justify-center rounded-lg text-[#49685d] hover:bg-[#edf6ef] hover:text-[#176b5b]"
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
                              className="flex h-10 w-10 items-center justify-center rounded-lg text-[#49685d] hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>

      <ResourceFormDialog
        key={editing.key}
        open={editing.open}
        onOpenChange={(open) => setEditing((current) => ({ ...current, open }))}
        resource={editing.resource}
        onSaved={refresh}
        defaultSource="Partagé par le kinésithérapeute"
        simplifiedKineForm
      />
      <ConfirmationDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Supprimer ce contenu ?"
        description={`« ${toDelete?.title ?? ""} » ne sera plus accessible aux patients.`}
        onConfirm={() => void confirmDelete()}
      />
    </main>
  );
}
