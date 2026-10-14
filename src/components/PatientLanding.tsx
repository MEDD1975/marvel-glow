import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, Route as RouteIcon, ShieldCheck, Users } from "lucide-react";
import { readStoredPathway, writeStoredPathway } from "@/lib/patient-pathway";
import { getPathwayGuide } from "@/lib/patient-guides";
import { ActionCard, SafetyNotice } from "@/components/patient/PatientUi";

export function PatientLanding({ pathway, doctorName }: { pathway?: string; doctorName?: string }) {
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
  const guide = getPathwayGuide(effectivePathway);
  const parcoursSearch: Record<string, string> | undefined = effectivePathway
    ? { pathway: effectivePathway, ...(doctorName ? { doctorName } : {}) }
    : undefined;

  return (
    <div className="flex flex-col gap-9">
      <section aria-labelledby="landing-title" className="rounded-3xl border border-border/60 bg-card p-5">
        <p className="flex items-center gap-1.5 text-[13px] font-medium text-tone-green-text">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          {doctorName ? `Transmis par ${doctorName}` : "Proposé par votre médecin"}
        </p>
        <h1 id="landing-title" className="mt-2.5 text-balance text-[1.75rem] font-semibold leading-tight tracking-tight text-foreground">
          {guide ? guide.name : "Bienvenue sur Kivoir"}
        </h1>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
          Votre outil d&apos;information et d&apos;aide au parcours de soins, entre deux rendez-vous.
        </p>
        <Link
          to={guide ? "/patient" : "/conseils"}
          {...(!guide && effectivePathway ? { search: { c: effectivePathway } } : {})}
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 text-base font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {guide ? "Ouvrir mon espace" : "Voir mes conseils"}
        </Link>
      </section>

      <nav aria-label="Rubriques" className="flex flex-col gap-2.5">
        <ActionCard
          to="/conseils"
          search={effectivePathway ? { c: effectivePathway } : undefined}
          icon={BookOpen}
          tone="blue"
          title="Ma bibliothèque de conseils"
          description="Fiches, vidéos et signes d'alerte"
        />
        <ActionCard
          to="/annuaire"
          icon={Users}
          tone="green"
          title="Professionnels recommandés"
          description="Les contacts communiqués par votre cabinet"
        />
        <ActionCard
          to="/parcours"
          search={parcoursSearch}
          icon={RouteIcon}
          tone="violet"
          title="Mon parcours"
          description="Les étapes de votre suivi, au fil des rendez-vous"
        />
      </nav>

      <p className="text-center text-xs text-muted-foreground">Sans compte · Disponible à tout moment · Confidentiel</p>
      <SafetyNotice />
    </div>
  );
}
