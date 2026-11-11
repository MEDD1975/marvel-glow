import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  Link2,
  Pencil,
  Plus,
  QrCode,
  Search,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ConfirmationDialog } from "@/components/doctor/ConfirmationDialog";
import { ResourceFormDialog } from "@/components/doctor/ResourceFormDialog";
import {
  doctorKeys,
  sendJson,
  useDoctorCache,
  useDoctorResources,
} from "@/components/doctor/use-doctor-data";
import { findCondition, resourceKind, resourceKindLabels } from "@/lib/doctor-pathway-info";
import type { DoctorResourceRecord } from "@/lib/doctor-resource-db";

export const Route = createFileRoute("/cabinet/kine")({
  component: KineWorkspace,
});

const recentTransmissions = [
  {
    patient: "Patient transmis par le cabinet",
    focus: "Entorse de cheville",
    date: "Aujourd’hui",
    count: "4 contenus",
  },
  {
    patient: "Nouvelle transmission",
    focus: "Reprise progressive de l’appui",
    date: "Hier",
    count: "3 contenus",
  },
];

function KineWorkspace() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const { data: session, isPending } = authClient.useSession();
  const resources = useDoctorResources(session?.user?.id);
  const cache = useDoctorCache();
  const [librarySearch, setLibrarySearch] = useState("");
  const [editing, setEditing] = useState<{
    open: boolean;
    resource: DoctorResourceRecord | null;
    key: number;
  }>({ open: false, resource: null, key: 0 });
  const [toDelete, setToDelete] = useState<DoctorResourceRecord | null>(null);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [transmissionOpen, setTransmissionOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedCondition, setSelectedCondition] = useState("Entorse de cheville");
  const [patientLabel, setPatientLabel] = useState("");

  const refreshResources = () => cache.invalidateQueries({ queryKey: doctorKeys.resources });
  const openResourceForm = (resource: DoctorResourceRecord | null) =>
    setEditing((current) => ({ open: true, resource, key: current.key + 1 }));
  const startTransmission = (condition = "Entorse de cheville") => {
    setSelectedCondition(condition);
    setSelectedItems(
      (resources.data ?? [])
        .filter((item) => item.status === "active")
        .slice(0, 3)
        .map((item) => item.id),
    );
    setPreviewOpen(false);
    setTransmissionOpen(true);
  };

  const toggleVisibility = async (item: DoctorResourceRecord) => {
    setLibraryError(null);
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
      await refreshResources();
    } catch (cause) {
      setLibraryError(cause instanceof Error ? cause.message : "La modification a échoué.");
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setLibraryError(null);
    try {
      await sendJson("/api/doctor-resources", "DELETE", { id: toDelete.id });
      await refreshResources();
    } catch (cause) {
      setLibraryError(cause instanceof Error ? cause.message : "La suppression a échoué.");
    } finally {
      setToDelete(null);
    }
  };

  const libraryItems = (resources.data ?? []).filter((item) =>
    item.title.toLowerCase().includes(librarySearch.trim().toLowerCase()),
  );

  const toggleItem = (title: string) => {
    setSelectedItems((current) =>
      current.includes(title) ? current.filter((item) => item !== title) : [...current, title],
    );
  };
  const currentUser = session?.user as { role?: string; profession?: string } | undefined;
  const role = currentUser?.role;
  const canAccess =
    role === "kine" ||
    role === "kinesitherapeute" ||
    role === "admin_kivoir" ||
    currentUser?.profession === "kinesitherapeute";

  if (isPending)
    return <p className="p-8 text-sm text-muted-foreground">Vérification de votre accès…</p>;
  if (!canAccess) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <section className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#177e78]">
            Espace kinésithérapeute
          </p>
          <h1 className="mt-3 text-2xl font-bold text-foreground">
            Cet espace est réservé aux comptes kiné.
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Connectez-vous avec une entrée kiné dédiée ou demandez une invitation professionnelle.
          </p>
          <Link
            to="/connexion-kine"
            className="mt-6 inline-flex rounded-xl bg-[#177e78] px-4 py-3 font-semibold text-white"
          >
            Accéder à la connexion kiné
          </Link>
        </section>
      </main>
    );
  }
  if (pathname.startsWith("/cabinet/kine/")) return <Outlet />;

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-8 md:py-10">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#177e78]">
          Espace kinésithérapeute
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Prolongez vos séances à la maison.
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          Créez votre bibliothèque une fois, puis transmettez en quelques clics les contenus
          réellement montrés pendant chaque séance.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3" aria-label="Actions principales">
        <Link
          to="/cabinet/kine/ressources"
          className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#177e78]/40 hover:shadow-md"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#177e78]/10 text-[#177e78]">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-lg font-bold text-foreground">Ma bibliothèque</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Vos vidéos, fiches et conseils personnels, classés par trouble et par phase.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#177e78]">
            Gérer mes contenus <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </Link>
        <button
          type="button"
          onClick={() => startTransmission()}
          className="group rounded-2xl bg-[#177e78] p-5 text-left text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#177e78]/90 hover:shadow-md"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
            <QrCode className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-lg font-bold">Nouvelle transmission</h2>
          <p className="mt-2 text-sm leading-6 text-white/80">
            Sélectionnez les contenus montrés aujourd’hui et transmettez-les par QR code.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
            Commencer <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </button>
        <Link
          to="/cabinet/kine"
          hash="transmissions"
          className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#177e78]/40 hover:shadow-md"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F3EFE6] text-[#9A6B28]">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-lg font-bold text-foreground">Mes transmissions</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Retrouvez ce qui a déjà été envoyé et reprenez le fil à la séance suivante.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#177e78]">
            Voir l’historique <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </Link>
      </section>

      <section
        id="transmissions"
        className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#177e78]">
              Le fil de vos séances
            </p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">Dernières transmissions</h2>
          </div>
          <button
            type="button"
            onClick={() => startTransmission()}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold text-foreground hover:bg-muted"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nouvelle transmission
          </button>
        </div>
        <div className="mt-5 divide-y divide-border">
          {recentTransmissions.map((item) => (
            <div
              key={`${item.focus}-${item.date}`}
              className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div>
                <p className="font-semibold text-foreground">{item.focus}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.patient} · {item.count}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{item.date}</span>
                <button
                  type="button"
                  onClick={() => startTransmission(item.focus)}
                  className="text-sm font-semibold text-[#177e78] hover:underline"
                >
                  Reprendre
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="bibliotheque"
        className="scroll-mt-24 rounded-2xl border border-border bg-[#F5FAF8] p-5 md:p-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#177e78]">
              Vos contenus enregistrés
            </p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">Ma bibliothèque</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {resources.data?.length ?? 0} contenu{resources.data?.length === 1 ? "" : "s"} ·
              vidéos, documents, photos et liens
            </p>
          </div>
          <button
            type="button"
            onClick={() => openResourceForm(null)}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#177e78] px-4 text-sm font-semibold text-white hover:bg-[#177e78]/90"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Ajouter un contenu
          </button>
        </div>
        <label className="relative mt-5 block max-w-md">
          <span className="sr-only">Rechercher dans ma bibliothèque</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={librarySearch}
            onChange={(event) => setLibrarySearch(event.target.value)}
            placeholder="Rechercher un contenu"
            className="min-h-11 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        {libraryError ? (
          <p
            role="alert"
            className="mt-3 rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
          >
            {libraryError}
          </p>
        ) : null}
        {resources.isPending ? (
          <p className="mt-5 text-sm text-muted-foreground">Chargement de votre bibliothèque…</p>
        ) : resources.isError ? (
          <div className="mt-5 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            <p>Impossible de charger votre bibliothèque.</p>
            <button
              type="button"
              onClick={() => void resources.refetch()}
              className="mt-2 font-semibold text-[#177e78] hover:underline"
            >
              Réessayer
            </button>
          </div>
        ) : !libraryItems.length ? (
          <div className="mt-5 rounded-xl border border-dashed border-border bg-card p-7 text-center">
            <p className="font-semibold text-foreground">
              {resources.data?.length ? "Aucun résultat" : "Votre bibliothèque est vide"}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Ajoutez une vidéo, un document PDF, une photo ou un lien à partager avec vos patients.
            </p>
            {!resources.data?.length ? (
              <button
                type="button"
                onClick={() => openResourceForm(null)}
                className="mt-4 min-h-11 rounded-xl bg-[#177e78] px-4 text-sm font-semibold text-white"
              >
                Ajouter mon premier contenu
              </button>
            ) : null}
          </div>
        ) : (
          <ul className="mt-5 flex flex-col gap-3">
            {libraryItems.map((item) => {
              const kind = resourceKind(item);
              const Icon =
                item.contentType?.startsWith("video/") || kind === "video"
                  ? Video
                  : item.contentType?.startsWith("image/")
                    ? ImageIcon
                    : kind === "link"
                      ? Link2
                      : FileText;
              const hidden = item.status === "hidden";
              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center"
                >
                  {item.contentType?.startsWith("image/") ? (
                    <img
                      src={item.url}
                      alt={`Aperçu de ${item.title}`}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#177e78]/10 text-[#177e78]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#177e78]/10 px-2 py-1 text-xs font-medium text-[#177e78]">
                        {resourceKindLabels[kind]}
                      </span>
                      {hidden ? (
                        <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                          Masqué
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {findCondition(item.conditionId)?.name ?? "Parcours"}
                      {item.filename ? ` · ${item.filename}` : ""}
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
                      onClick={() => openResourceForm(item)}
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
      </section>
      <ResourceFormDialog
        key={editing.key}
        open={editing.open}
        onOpenChange={(open) => setEditing((current) => ({ ...current, open }))}
        resource={editing.resource}
        onSaved={refreshResources}
        defaultSource="Partagé par le kinésithérapeute"
        filePickerOnModeSelect
      />
      <ConfirmationDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Supprimer ce contenu ?"
        description={`« ${toDelete?.title ?? ""} » ne sera plus accessible aux patients.`}
        onConfirm={() => void confirmDelete()}
      />
      {transmissionOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-5"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setTransmissionOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="transmission-title"
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#177e78]">
                  Nouvelle transmission
                </p>
                <h2 id="transmission-title" className="mt-2 text-2xl font-bold text-slate-900">
                  {previewOpen ? "Prévisualisation patient" : "Préparer la séance"}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => setTransmissionOpen(false)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {previewOpen ? (
              <div className="mt-5 space-y-5">
                <div className="rounded-2xl bg-[#f3faf7] p-4">
                  <p className="text-sm text-slate-600">Parcours</p>
                  <p className="mt-1 font-semibold text-slate-900">{selectedCondition}</p>
                  {patientLabel.trim() && (
                    <p className="mt-2 text-sm text-slate-600">Repère patient : {patientLabel}</p>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Contenus transmis</h3>
                  <ul className="mt-2 space-y-2">
                    {selectedItems.map((id) => {
                      const item = resources.data?.find((resource) => resource.id === id);
                      return item ? (
                        <li
                          key={item.id}
                          className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
                        >
                          {item.title}
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  Voici l’aperçu des contenus sélectionnés. La transmission et le QR code seront
                  activés lorsque le parcours patient sera relié à cet espace.
                </p>
                <div className="flex flex-wrap justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    Modifier la sélection
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransmissionOpen(false)}
                    className="rounded-xl bg-[#177e78] px-4 py-3 text-sm font-semibold text-white"
                  >
                    Terminer l’aperçu
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-800">
                    Parcours / motif
                  </span>
                  <select
                    value={selectedCondition}
                    onChange={(event) => setSelectedCondition(event.target.value)}
                    className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  >
                    <option>Entorse de cheville</option>
                    <option>Reprise progressive de l’appui</option>
                    <option>Arthrose du genou</option>
                    <option>Exercices d’équilibre</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-800">
                    Repère patient (facultatif)
                  </span>
                  <input
                    value={patientLabel}
                    onChange={(event) => setPatientLabel(event.target.value)}
                    maxLength={50}
                    placeholder="Initiales ou repère local"
                    className="min-h-12 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 placeholder:text-slate-400"
                  />
                </label>
                <fieldset>
                  <legend className="mb-2 text-sm font-semibold text-slate-800">
                    Sélectionnez les contenus montrés
                  </legend>
                  <div className="space-y-2">
                    {(resources.data ?? [])
                      .filter((item) => item.status === "active")
                      .map((item) => (
                        <label
                          key={item.id}
                          className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 hover:border-[#177e78]/50"
                        >
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => toggleItem(item.id)}
                            className="mt-1 accent-[#177e78]"
                          />
                          <span>
                            <span className="block text-sm font-semibold text-slate-900">
                              {item.title}
                            </span>
                            <span className="mt-1 block text-xs text-slate-500">
                              {resourceKindLabels[resourceKind(item)]} ·{" "}
                              {findCondition(item.conditionId)?.name ?? "Parcours"}
                            </span>
                          </span>
                        </label>
                      ))}
                  </div>
                </fieldset>
                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setTransmissionOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    disabled={selectedItems.length === 0}
                    onClick={() => setPreviewOpen(true)}
                    className="rounded-xl bg-[#177e78] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Prévisualiser ({selectedItems.length})
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
