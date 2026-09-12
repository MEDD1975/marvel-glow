import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { readStoredPathway, writeStoredPathway } from "@/lib/patient-pathway";
import {
  AlertTriangle,
  Bot,
  ArrowRight,
  BookOpen,
  Compass,
  MapPin,
  PlayCircle,
} from "lucide-react";

export const medicalDisclaimer =
  "Cet outil numérique ne remplace pas un avis médical. En cas de doute, consultez un professionnel de santé.";

export function MedicalDisclaimer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-urgent/20 bg-urgent/5 p-4 text-sm text-foreground ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-urgent" aria-hidden="true" />
        <p>{medicalDisclaimer}</p>
      </div>
    </div>
  );
}

function openAssistant() {
  window.dispatchEvent(new CustomEvent("kivoir:open-assistant"));
}

function KivoirCover({ onStart }: { onStart: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("kivoir:cover-visibility", { detail: { visible: false } }));
    }, 0);
    return () => {
      window.clearTimeout(timer);
      window.dispatchEvent(new CustomEvent("kivoir:cover-visibility", { detail: { visible: true } }));
    };
  }, []);

  return (
    <section className="flex min-h-[calc(100svh-7rem)] items-center justify-center px-4 py-10 sm:min-h-[calc(100svh-5rem)]">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-care/20 bg-card px-6 py-10 text-center shadow-xl shadow-care/10 md:px-12 md:py-16">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-care/10 blur-2xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-primary/10 blur-2xl" aria-hidden="true" />
        <div className="relative">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border border-care/20 bg-care/10 p-5 shadow-sm">
            <img src="/favicon.svg" alt="" className="h-full w-full" />
          </div>
          <p className="mt-7 text-sm font-semibold uppercase tracking-[0.16em] text-care">Votre espace patient</p>
          <h1 className="mt-3 text-5xl font-semibold tracking-[-0.05em] text-foreground md:text-7xl">Kivoir</h1>
          <p className="mx-auto mt-5 max-w-md text-pretty text-lg leading-8 text-muted-foreground md:text-xl">
            Votre outil d&apos;information et d&apos;aide au parcours de soins, proposé par votre médecin.
          </p>
          <button
            type="button"
            onClick={onStart}
            className="mt-9 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Commencer
          </button>
          <p className="mt-5 text-xs text-muted-foreground">Un accompagnement simple, entre deux rendez-vous</p>
        </div>
      </div>
    </section>
  );
}

export function AssistantHome({ initialStarted = false, pathway }: { initialStarted?: boolean; pathway?: string }) {
  const [hasStarted, setHasStarted] = useState(initialStarted);
  const [storedPathway, setStoredPathway] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (pathway) {
      writeStoredPathway(pathway);
      setStoredPathway(pathway);
    } else {
      setStoredPathway(readStoredPathway() ?? undefined);
    }
  }, [pathway]);
  const effectivePathway = pathway ?? storedPathway;

  if (!hasStarted) {
    return <KivoirCover onStart={() => setHasStarted(true)} />;
  }

  return (
    <section className="px-4 py-8 md:py-12">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-care/20 bg-card p-5 shadow-lg shadow-care/10 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-care/10 px-3 py-1.5 text-sm font-semibold text-care">
            <Bot className="h-4 w-4" aria-hidden="true" />
            Accès transmis par votre médecin
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
            Partenaire CPTS
          </span>
        </div>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] text-foreground md:text-4xl">
          Prolongez votre consultation en toute simplicité
        </h1>
        <p className="mt-3 text-pretty text-base leading-7 text-muted-foreground">
          Retrouvez vos questions, vos conseils et les bons professionnels après votre rendez-vous.
        </p>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <button
            type="button"
            onClick={openAssistant}
            className="group flex min-h-48 flex-col rounded-3xl border border-primary/25 bg-primary/5 p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-primary/45 hover:bg-primary/10 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Compass className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-primary">Poser mes questions</span>
            <span className="mt-1.5 text-lg font-semibold text-foreground">Mon orientation</span>
            <span className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">Échangez avec l&apos;Assistant pour clarifier vos questions, identifier la bonne spécialité et trouver le bon professionnel.</span>
            <span className="mt-2 text-xs leading-5 text-muted-foreground">L&apos;Assistant informe et oriente ; il ne remplace pas l&apos;avis médical.</span>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">Poser mes questions <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
          </button>

          <Link
            to="/conseils"
            search={effectivePathway ? { c: effectivePathway } : undefined}
            className="group flex min-h-48 flex-col rounded-3xl border border-care/20 bg-care/5 p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-care/40 hover:bg-care/10 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-care text-primary-foreground shadow-sm">
              <BookOpen className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-care">Ma bibliothèque de conseils</span>
            <span className="mt-1.5 text-lg font-semibold text-foreground">Fiches et vidéos utiles</span>
            <span className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">Retrouvez les fiches, vidéos et liens sélectionnés par votre médecin, organisés par thème.</span>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-care">Consulter <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
          </Link>

          <Link
            to="/annuaire"
            className="group flex min-h-48 flex-col rounded-3xl border border-care/20 bg-care/5 p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-care/40 hover:bg-care/10 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-care text-primary-foreground shadow-sm">
              <MapPin className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-care">L&apos;annuaire de la CPTS</span>
            <span className="mt-1.5 text-lg font-semibold text-foreground">Trouver le bon professionnel</span>
            <span className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">Recherchez les kinésithérapeutes, podologues et autres professionnels près de chez vous.</span>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-care">Voir l&apos;annuaire <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
          </Link>
        </div>

        <button
          type="button"
          onClick={openAssistant}
          className="group mt-6 flex w-full items-center gap-4 rounded-2xl bg-primary p-4 text-left text-primary-foreground shadow-xl shadow-primary/20 ring-1 ring-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:p-5"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15">
            <Bot className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">Poser vos questions à l&apos;Assistant Kivoir</span>
            <span className="mt-0.5 block text-sm text-primary-foreground/85">
              Appuyez ici pour poser votre question dès maintenant
            </span>
          </span>
        </button>

        <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <PlayCircle className="h-4 w-4 text-care" aria-hidden="true" />
          Sans compte · Disponible à tout moment · Vos réponses restent confidentielles
        </p>
      </div>
    </section>
  );
}
