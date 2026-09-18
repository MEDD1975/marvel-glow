import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { readStoredPathway, writeStoredPathway } from "@/lib/patient-pathway";
import {
  AlertTriangle,
  Bot,
  ArrowRight,
  BookOpen,
  ListChecks,
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

function KivoirCover({ onStart }: { onStart: () => void }) {
  return (
    <section className="flex justify-center py-2 md:py-4">
      <div className="w-full max-w-2xl rounded-[2rem] border border-care/20 bg-card px-6 py-8 text-center shadow-lg shadow-care/10 md:px-12 md:py-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-care/20 bg-care/10 p-4">
          <img src="/favicon.svg" alt="" className="h-full w-full" />
        </div>
        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-care">Votre espace patient</p>
        <h1 className="mt-2 text-5xl font-semibold tracking-[-0.05em] text-foreground md:text-6xl">Kivoir</h1>
        <p className="mx-auto mt-4 max-w-md text-pretty text-lg leading-8 text-muted-foreground">Votre outil d&apos;information et d&apos;aide au parcours de soins, proposé par votre médecin.</p>
        <button type="button" onClick={onStart} className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Commencer</button>
        <p className="mt-4 text-xs text-muted-foreground">Un accompagnement simple, entre deux rendez-vous</p>
      </div>
    </section>
  );
}

export function AssistantHome({ initialStarted = false, pathway }: { initialStarted?: boolean; pathway?: string }) {
  const [hasStarted, setHasStarted] = useState(initialStarted || Boolean(pathway));
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
    <section className="px-4 py-3 md:py-4 lg:py-5">
      <div className="mx-auto w-full max-w-6xl rounded-[2rem] border border-care/20 bg-card p-4 shadow-lg shadow-care/10 md:p-5 lg:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-care/10 px-3 py-1.5 text-sm font-semibold text-care">
            <Bot className="h-4 w-4" aria-hidden="true" />
            Accès transmis par votre médecin
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
            Réseau professionnel
          </span>
        </div>
        <h1 className="mt-2 text-balance text-2xl font-semibold tracking-[-0.02em] text-foreground md:text-3xl lg:text-4xl">
          Votre assistant après consultation
        </h1>
        <p className="mt-2 text-pretty text-sm leading-6 text-muted-foreground md:text-base">
          Retrouvez vos questions, vos conseils et les bons professionnels pour mieux comprendre la suite de votre prise en charge.
        </p>

        <div className="mt-4 grid gap-3 md:mt-4 md:grid-cols-3 md:gap-3">
          <Link
            to="/suivi"
            search={effectivePathway ? { c: effectivePathway } : undefined}
            className="group flex min-h-48 flex-col rounded-3xl border border-primary/25 bg-primary/5 p-4 md:min-h-0 md:p-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-primary/45 hover:bg-primary/10 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <ListChecks className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-primary">Mon suivi</span>
            <span className="mt-1.5 text-lg font-semibold text-foreground">Suivre mes étapes de soin</span>
            <span className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">Avancez, étape par étape, dans les consignes définies par votre professionnel de santé et répondez à ses questions de contrôle.</span>
            <span className="mt-2 text-xs leading-5 text-muted-foreground">Kivoir vous informe et vous aide à préparer la suite ; il ne remplace pas l&apos;avis médical.</span>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">Ouvrir mon suivi <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
          </Link>

          <Link
            to="/conseils"
            search={effectivePathway ? { c: effectivePathway } : undefined}
            className="group flex min-h-48 flex-col rounded-3xl border border-care/20 bg-care/5 p-4 md:min-h-0 md:p-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-care/40 hover:bg-care/10 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            className="group flex min-h-48 flex-col rounded-3xl border border-care/20 bg-care/5 p-4 md:min-h-0 md:p-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-care/40 hover:bg-care/10 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-care text-primary-foreground shadow-sm">
              <MapPin className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-care">Réseau professionnel</span>
            <span className="mt-1.5 text-lg font-semibold text-foreground">Consulter le réseau de votre médecin</span>
            <span className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">Retrouvez les professionnels du réseau de votre médecin.</span>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-care">Voir l&apos;annuaire <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
          </Link>
        </div>

        <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <PlayCircle className="h-4 w-4 text-care" aria-hidden="true" />
          Sans compte · Disponible à tout moment · Vos réponses restent confidentielles
        </p>
      </div>
    </section>
  );
}
