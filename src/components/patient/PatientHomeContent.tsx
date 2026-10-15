import { AlertTriangle, CheckCircle2, FolderOpen, Route as RouteIcon, ShieldCheck, Users } from "lucide-react";
import { usePatient } from "@/components/patient/PatientProvider";
import { ActionCard, DecisionCard, LoadingState, SafetyNotice } from "@/components/patient/PatientUi";

export function PatientHomeContent() {
  const { ready, guide, hasContext, senderLabel } = usePatient();
  if (!ready) return <LoadingState />;

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="home-title">
        {hasContext ? (
          <div className="rounded-[14px] border border-[#DCE5F0] border-l-4 border-l-[#0B63CE] bg-white px-4 py-3">
            <p className="flex items-center gap-1.5 text-[13px] font-medium text-[#526176]">
              <ShieldCheck className="h-4 w-4 text-[#0B63CE]" aria-hidden="true" />
              {senderLabel}
            </p>
            {guide ? <p className="mt-1 text-sm font-semibold text-[#101C33]">{`Parcours : ${guide.name}`}</p> : null}
          </div>
        ) : null}
        <h1 id="home-title" className="mt-3 text-balance text-[1.75rem] font-semibold leading-tight tracking-tight text-foreground md:text-3xl">
          Vos repères après la consultation
        </h1>
        <p className="mt-2 text-pretty text-base leading-relaxed text-muted-foreground">
          Retrouvez les conseils utiles, les points à surveiller et les professionnels pouvant intervenir dans la suite de votre parcours.
        </p>
        <p className="mt-4 rounded-xl border border-border bg-card px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          Kivoir affiche un parcours d’information sélectionné par votre professionnel de santé. Aucun compte patient n’est nécessaire. Ne saisissez aucune information personnelle ou médicale.
        </p>
      </section>

      <nav aria-label="L'essentiel" className="grid gap-3">
        <DecisionCard
          step={1}
          to="/conseils"
          icon={CheckCircle2}
          tone="green"
          title="Ce que je dois faire maintenant"
          description="Retrouvez les recommandations transmises pour votre parcours."
          action="Voir mes recommandations"
        />
        <DecisionCard
          step={2}
          to="/conseils"
          hash="surveiller"
          icon={AlertTriangle}
          tone="orange"
          title="Ce que je dois surveiller"
          description="Identifiez les situations nécessitant un nouvel avis professionnel."
          action="Voir les points à surveiller"
        />
        <DecisionCard
          step={3}
          to="/annuaire"
          icon={Users}
          tone="blue"
          title="Qui contacter ensuite"
          description="Retrouvez les professionnels communiqués par votre cabinet."
          action="Trouver un professionnel"
        />
      </nav>

      <section aria-labelledby="secondary-title">
        <h2 id="secondary-title" className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Pour aller plus loin
        </h2>
        <div className="grid gap-2.5 md:grid-cols-2">
          <ActionCard to="/conseils" hash="ressources" icon={FolderOpen} tone="blue" title="Mes ressources" description="Conseils, documents et vidéos sélectionnés pour votre parcours" />
          <ActionCard to="/parcours" icon={RouteIcon} tone="blue" title="La suite de mon parcours" description="Les prochaines étapes et repères transmis" />
        </div>
      </section>

      <SafetyNotice />
    </div>
  );
}
