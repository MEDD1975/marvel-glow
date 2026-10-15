import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronDown, CircleAlert, CircleCheck, Clock3, Phone, Users } from "lucide-react";
import { useState } from "react";
import { PatientShell } from "@/components/patient/PatientShell";
import { useFollowUpSteps, usePatient, useProfessionals } from "@/components/patient/PatientProvider";
import { EmptyState, LoadingState, SafetyNotice } from "@/components/patient/PatientUi";

type ParcoursSearch = { pathway?: string | undefined };

export const Route = createFileRoute("/parcours")({
  validateSearch: (search: Record<string, unknown>): ParcoursSearch => ({
    pathway: typeof search["pathway"] === "string" ? search["pathway"] : undefined,
    }),
  head: () => ({
    meta: [
      { title: "La suite de mon parcours — Kivoir" },
      { name: "description", content: "Des repères simples dans le temps pour suivre le parcours transmis par votre professionnel de santé." },
    ],
  }),
  component: ParcoursRoute,
});

function ParcoursRoute() {
  const search = Route.useSearch();
  return (
    <PatientShell search={search} requireFreshContext>
      <ParcoursPage />
    </PatientShell>
  );
}

type CheckIn = "improves" | "persists" | "concerned";

function ParcoursPage() {
  const { ready, guide, context, cabinetPhone } = usePatient();
  const followUp = useFollowUpSteps();
  const professionals = useProfessionals();
  const [openStep, setOpenStep] = useState(2);
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);

  const chooseCheckIn = (value: CheckIn) => {
    setCheckIn(value);
    setOpenStep(3);
  };

  if (!ready || followUp.isLoading) return <LoadingState />;

  if (!guide) {
    return (
      <div className="flex flex-col gap-8">
        <EmptyState title="Aucun parcours ouvert" description="Scannez le QR code remis par votre professionnel de santé pour retrouver les prochaines étapes de votre parcours." action={<Link to="/annuaire" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-accent">Rechercher un cabinet</Link>} />
      </div>
    );
  }

  const resourcesHref = "/patient/ressources" as const;
  const steps = [
    { id: 0, label: "Point de départ", title: "Votre situation a été évaluée", text: "Retrouvez les informations et les premiers repères transmis après votre consultation.", icon: CircleCheck },
    { id: 1, label: "Maintenant", title: "Suivre les recommandations transmises", text: "Consultez les conseils, précautions et ressources sélectionnés pour votre parcours.", icon: Clock3 },
    { id: 2, label: "Faire le point", title: "Comment évolue votre situation ?", text: "Choisissez simplement la situation qui se rapproche le plus de votre évolution.", icon: CircleAlert },
    { id: 3, label: "Prochaine étape", title: nextStepTitle(checkIn), text: nextStepText(checkIn), icon: Users },
  ];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <Link to="/patient" className="-ml-2 mb-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Retour à mon espace patient</Link>
        <h1 className="text-balance text-[1.625rem] font-semibold leading-tight tracking-tight text-foreground md:text-3xl">La suite de mon parcours</h1>
        <p className="mt-2 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">Un fil conducteur après votre diagnostic : où vous en êtes, quoi faire maintenant et quelle action envisager si la gêne persiste.</p>
        <div className="mt-4 rounded-xl border border-care/20 bg-tone-blue px-3 py-2 text-sm text-care"><strong>Parcours : {guide.name}</strong></div>
      </div>

      <section aria-labelledby="etapes-title"><h2 id="etapes-title" className="sr-only">Fil conducteur du parcours</h2><ol className="flex flex-col gap-3">
        {steps.map((step) => { const Icon = step.icon; const isOpen = openStep === step.id; return <li key={step.id} className={`rounded-2xl border transition-colors ${isOpen ? "border-care/30 bg-tone-blue/30" : "border-border bg-card"}`}>
          <button type="button" aria-expanded={isOpen} aria-controls={`parcours-step-${step.id}`} onClick={() => setOpenStep(isOpen ? -1 : step.id)} className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"><span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${isOpen ? "bg-care text-primary-foreground" : "bg-muted text-care"}`}><Icon className="size-5" aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold uppercase tracking-wide text-care">{step.label}</span><span className="mt-0.5 block font-semibold text-foreground">{step.title}</span></span><ChevronDown className={`size-5 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" /></button>
          {isOpen ? <div id={`parcours-step-${step.id}`} className="border-t border-border/70 px-4 pb-4 pt-3 md:pl-16">{step.id === 0 ? <><p className="text-sm leading-relaxed text-muted-foreground">{step.text}</p><div className="mt-3 flex flex-wrap gap-2"><Link to="/conseils" className="min-h-11 rounded-xl bg-care px-4 py-2.5 text-sm font-semibold text-primary-foreground">Comprendre mon atteinte</Link><Link to="/patient/surveiller" className="min-h-11 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground">Voir les points à surveiller</Link></div></> : step.id === 1 ? <><p className="text-sm leading-relaxed text-muted-foreground">{step.text}</p><div className="mt-3 flex flex-wrap gap-2"><Link to="/patient/recommandations" className="min-h-11 rounded-xl bg-care px-4 py-2.5 text-sm font-semibold text-primary-foreground">Voir mes recommandations</Link><Link to={resourcesHref} className="min-h-11 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground">Voir mes ressources</Link></div></> : step.id === 2 ? <CheckInChoices selected={checkIn} onChoose={chooseCheckIn} /> : <NextStep checkIn={checkIn} cabinetPhone={cabinetPhone} professionalCount={professionals.professionals.length} />}</div> : null}
        </li>; })}
      </ol></section>

      <SafetyNotice>Cette chronologie fournit des repères généraux à partir du parcours transmis. Elle ne remplace pas les décisions prises avec votre professionnel de santé. En cas de doute, d’évolution défavorable ou de situation préoccupante, demandez un avis professionnel.</SafetyNotice>
    </div>
  );
}

function nextStepTitle(checkIn: CheckIn | null) {
  if (checkIn === "improves") return "Poursuivez selon les recommandations reçues";
  if (checkIn === "persists") return "Un nouvel avis peut être utile";
  if (checkIn === "concerned") return "Consultez les points à surveiller";
  return "Choisissez votre situation pour voir la prochaine action";
}

function nextStepText(checkIn: CheckIn | null) {
  if (checkIn === "improves") return "Continuez à suivre les conseils et la prise en charge indiqués par votre professionnel de santé.";
  if (checkIn === "persists") return "Si la gêne persiste, limite vos activités ou ne correspond pas à l’évolution attendue, un professionnel pourra réévaluer votre situation.";
  if (checkIn === "concerned") return "Retrouvez les situations pour lesquelles un avis professionnel doit être demandé.";
  return "Ce choix est facultatif et ne constitue pas une évaluation médicale.";
}

function CheckInChoices({ selected, onChoose }: { selected: CheckIn | null; onChoose: (value: CheckIn) => void }) {
  const choices: Array<{ id: CheckIn; label: string; className: string }> = [
    { id: "improves", label: "Ça s’améliore", className: "border-tone-green-border/50 bg-tone-green/60 text-tone-green-text" },
    { id: "persists", label: "La gêne persiste", className: "border-tone-orange-border/50 bg-tone-orange/60 text-tone-orange-text" },
    { id: "concerned", label: "Un signe m’inquiète", className: "border-tone-red-border/50 bg-tone-red text-tone-red-text" },
  ];
  return <div><p className="text-sm leading-relaxed text-muted-foreground">Choisissez simplement la situation qui se rapproche le plus de votre évolution.</p><div className="mt-3 grid gap-2 sm:grid-cols-3">{choices.map((choice) => <button key={choice.id} type="button" aria-pressed={selected === choice.id} onClick={() => onChoose(choice.id)} className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-shadow hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${choice.className} ${selected === choice.id ? "ring-2 ring-care ring-offset-1" : ""}`}>{choice.label}</button>)}</div>{selected ? <button type="button" onClick={() => onChoose(selected)} className="mt-3 inline-flex min-h-10 items-center gap-1 text-sm font-medium text-muted-foreground underline underline-offset-4">Modifier mon choix</button> : null}</div>;
}

function NextStep({ checkIn, cabinetPhone, professionalCount }: { checkIn: CheckIn | null; cabinetPhone: string | undefined; professionalCount: number }) {
  if (checkIn === "improves") return <div><p className="text-sm leading-relaxed text-muted-foreground">{nextStepText(checkIn)}</p><div className="mt-3 flex flex-wrap gap-2"><Link to="/patient/recommandations" className="min-h-11 rounded-xl bg-care px-4 py-2.5 text-sm font-semibold text-primary-foreground">Voir mes recommandations</Link><Link to="/patient/ressources" className="min-h-11 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground">Voir mes ressources</Link></div></div>;
  if (checkIn === "persists") return <div><p className="text-sm leading-relaxed text-muted-foreground">{nextStepText(checkIn)}</p><div className="mt-3 flex flex-wrap gap-2">{cabinetPhone ? <a href={`tel:${cabinetPhone}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-care px-4 py-2.5 text-sm font-semibold text-primary-foreground"><Phone className="size-4" aria-hidden="true" />Contacter mon cabinet</a> : null}<Link to="/patient/professionnels" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground"><Users className="size-4" aria-hidden="true" />Voir les professionnels utiles{professionalCount ? ` (${professionalCount})` : ""}</Link></div>{!cabinetPhone ? <p className="mt-3 text-xs text-muted-foreground">Aucun numéro de cabinet n’est disponible dans ce parcours.</p> : null}</div>;
  if (checkIn === "concerned") return <div><p className="text-sm leading-relaxed text-muted-foreground">{nextStepText(checkIn)}</p><div className="mt-3 flex flex-wrap gap-2"><Link to="/patient/surveiller" className="min-h-11 rounded-xl bg-tone-red px-4 py-2.5 text-sm font-semibold text-tone-red-text">Voir les points à surveiller</Link><Link to="/patient/professionnels" className="min-h-11 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground">Demander un avis</Link></div></div>;
  return <p className="text-sm leading-relaxed text-muted-foreground">{nextStepText(checkIn)}</p>;
}

export default Route;
