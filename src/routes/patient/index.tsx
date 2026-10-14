import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, BookOpen, FolderOpen, Route as RouteIcon, ShieldCheck, Users } from "lucide-react";
import { usePatient } from "@/components/patient/PatientProvider";
import { ActionCard, LoadingState, NoPathwayState, SafetyNotice } from "@/components/patient/PatientUi";
import { AdviceSheet } from "@/components/patient/AdviceSheet";

export const Route = createFileRoute("/patient/")({
  component: PatientHome,
});

function PatientHome() {
  const { ready, guide, senderLabel, context } = usePatient();
  if (!ready) return <LoadingState />;
  if (!guide) {
    return (
      <div className="flex flex-col gap-5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Bienvenue sur Kivoir</h1>
        <NoPathwayState />
        <SafetyNotice />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="pathway-title" className="rounded-2xl border border-border bg-card p-5">
        <p className="flex items-center gap-1.5 text-sm font-medium text-tone-green-text">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          {senderLabel}
        </p>
        <h1 id="pathway-title" className="mt-3 text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground">
          {guide.name}
        </h1>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
          Retrouvez les conseils et les ressources utiles pour votre parcours.
        </p>
        {context.note ? (
          <p className="mt-4 rounded-xl bg-tone-blue px-4 py-3 text-sm text-foreground">
            <span className="font-semibold">Consigne de votre médecin : </span>
            {context.note}
          </p>
        ) : null}
        <Link
          to="/patient/recommandations"
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 text-base font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Voir mes conseils
        </Link>
      </section>

      <nav aria-label="Rubriques du parcours" className="flex flex-col gap-3">
        <ActionCard to="/patient/recommandations" icon={BookOpen} tone="blue" title="Ce que je peux faire" description="Les recommandations de votre parcours" />
        <ActionCard to="/patient/surveiller" icon={AlertTriangle} tone="orange" title="Quand consulter rapidement" description="Les signes qui doivent vous alerter" />
        <ActionCard to="/patient/ressources" icon={FolderOpen} tone="violet" title="Mes ressources" description="Documents, vidéos et exercices" />
        <ActionCard to="/patient/professionnels" icon={Users} tone="green" title="Professionnels recommandés" description="Les contacts communiqués par votre cabinet" />
        <ActionCard to="/patient/parcours" icon={RouteIcon} tone="blue" title="Mon parcours" description="Les grandes étapes de votre prise en charge" />
      </nav>

      <AdviceSheet />
      <SafetyNotice />
    </div>
  );
}
