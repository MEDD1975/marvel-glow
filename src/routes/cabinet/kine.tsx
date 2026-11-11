import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, FileText, Plus, QrCode, Video, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";

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

const libraryPreview = [
  { title: "Mobilité douce de la cheville", type: "Vidéo", phase: "Récupération", icon: Video },
  {
    title: "Reprise progressive de l’appui",
    type: "Conseil",
    phase: "Progression",
    icon: CheckCircle2,
  },
  { title: "Exercices d’équilibre", type: "Fiche PDF", phase: "Proprioception", icon: FileText },
];

function KineWorkspace() {
  const { data: session, isPending } = authClient.useSession();
  const [transmissionOpen, setTransmissionOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>(["Mobilité douce de la cheville"]);
  const [selectedCondition, setSelectedCondition] = useState("Entorse de cheville");
  const [patientLabel, setPatientLabel] = useState("");

  const startTransmission = (condition = "Entorse de cheville") => {
    setSelectedCondition(condition);
    setPreviewOpen(false);
    setTransmissionOpen(true);
  };

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
          to="/cabinet/kine"
          hash="bibliotheque"
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
        className="rounded-2xl border border-border bg-[#F5FAF8] p-5 md:p-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#177e78]">
              Votre contenu
            </p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">Aperçu de ma bibliothèque</h2>
          </div>
          <button
            type="button"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#177e78] px-3 text-sm font-semibold text-white hover:bg-[#177e78]/90"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Ajouter un contenu
          </button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {libraryPreview.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#177e78]/10 text-[#177e78]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                    {item.type}
                  </span>
                </div>
                <h3 className="mt-4 font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.phase}</p>
              </article>
            );
          })}
        </div>
      </section>
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
                    {selectedItems.map((title) => (
                      <li
                        key={title}
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
                      >
                        {title}
                      </li>
                    ))}
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
                    {libraryPreview.map((item) => (
                      <label
                        key={item.title}
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 hover:border-[#177e78]/50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.title)}
                          onChange={() => toggleItem(item.title)}
                          className="mt-1 accent-[#177e78]"
                        />
                        <span>
                          <span className="block text-sm font-semibold text-slate-900">
                            {item.title}
                          </span>
                          <span className="mt-1 block text-xs text-slate-500">
                            {item.type} · {item.phase}
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
