import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Check, FileText, HelpCircle, Printer, UserRound } from "lucide-react";
import { MedicalDisclaimer } from "@/components/HomeBlocks";

type JourneyStep = {
  id: string;
  label: string;
  title: string;
  description: string;
  action: string;
};

const journeySteps: JourneyStep[] = [
  { id: "consultation", label: "Étape 1", title: "Échange avec un professionnel", description: "Le diagnostic ou la situation est confirmé(e) avec le professionnel.", action: "Préparer mes questions" },
  { id: "documents", label: "Étape 2", title: "Examens et documents", description: "Rassemblez les résultats, comptes rendus et consignes déjà reçus.", action: "Rassembler mes documents" },
  { id: "care", label: "Étape 3", title: "Prise en charge", description: "Suivez le parcours recommandé pour la situation confirmée.", action: "Noter ma prochaine action" },
  { id: "follow-up", label: "Étape 4", title: "Point de suivi", description: "Préparez le prochain échange avec les éléments observés et vos nouvelles questions.", action: "Préparer mon suivi" },
];

const pathwayCatalog: Record<string, { label: string; professional: string; completed: string[]; next: string }> = {
  "entorse-cheville": { label: "Entorse de la cheville", professional: "Médecin ou kinésithérapeute", completed: ["consultation"], next: "Rassembler les documents et résultats remis" },
  "douleur-lombaire": { label: "Douleur lombaire", professional: "Médecin traitant ou spécialiste", completed: ["consultation"], next: "Préparer les éléments utiles au prochain échange" },
  "post-operatoire": { label: "Suivi post-opératoire", professional: "Chirurgien ou équipe de rééducation", completed: ["consultation", "documents"], next: "Suivre les consignes et préparer le point de suivi" },
};

type ParcoursSearch = { pathway?: string; access?: string };

export const Route = createFileRoute("/parcours")({
  validateSearch: (search: Record<string, unknown>): ParcoursSearch => ({
    pathway: typeof search.pathway === "string" ? search.pathway : undefined,
    access: typeof search.access === "string" ? search.access : undefined,
  }),
  head: () => ({ meta: [
    { title: "Votre parcours de soin — Kivoir" },
    { name: "description", content: "Une feuille de route pour comprendre les étapes de soin et préparer vos échanges avec les professionnels." },
    { property: "og:title", content: "Votre parcours de soin — Kivoir" },
    { property: "og:description", content: "Comprendre où vous en êtes, quoi préparer et quelle est la prochaine étape." },
  ] }),
  component: ParcoursPage,
});

function ParcoursPage() {
  const { pathway, access } = Route.useSearch();
  const pathwayInfo = pathway ? pathwayCatalog[pathway] : null;
  const [completed, setCompleted] = useState<string[]>(pathwayInfo?.completed ?? []);
  const [questions, setQuestions] = useState("");
  const [documents, setDocuments] = useState("");
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [preparedStepIds, setPreparedStepIds] = useState<string[]>([]);

  const preparationItems: Record<string, string[]> = {
    consultation: ["Noter ce que vous souhaitez expliquer", "Rassembler vos ordonnances ou comptes rendus", "Écrire vos questions"],
    documents: ["Identifier le document ou résultat reçu", "Noter sa date et le professionnel qui l’a remis", "Préparer ce que vous souhaitez comprendre"],
    care: ["Relire les consignes données", "Noter ce qui a été réalisé", "Identifier la prochaine action indiquée"],
    "follow-up": ["Noter les changements depuis le dernier échange", "Rassembler les nouveaux documents", "Préparer vos questions de suivi"],
  };

  const nextStep = useMemo(() => journeySteps.find((step) => !completed.includes(step.id)) ?? journeySteps[journeySteps.length - 1], [completed]);
  const activeStep = journeySteps.find((step) => step.id === (activeStepId ?? nextStep.id)) ?? nextStep;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-care">Kivoir · Qui voir, quand</p>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground md:text-6xl">Votre parcours de soin, enfin lisible.</h1>
        <p className="mt-5 text-pretty text-lg leading-8 text-muted-foreground">Le médecin vous accompagne. Kivoir vous aide à retrouver ce qui a été fait, ce qui vient ensuite et ce qu’il faut préparer.</p>
      </section>

      {pathwayInfo ? <div className="mt-10 rounded-2xl border border-care/20 bg-care/5 px-5 py-4"><p className="text-xs font-semibold uppercase tracking-wide text-care">Parcours attribué par votre professionnel</p><p className="mt-2 text-lg font-semibold text-foreground">{pathwayInfo.label}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Le professionnel concerné est : {pathwayInfo.professional}. Kivoir organise les étapes ; il ne pose pas le diagnostic.</p></div> : <div className="mt-10 rounded-2xl border border-border bg-card px-5 py-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Parcours non attribué</p><p className="mt-2 text-lg font-semibold text-foreground">Demandez votre lien à votre professionnel de santé</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Le parcours apparaît ici uniquement après confirmation d’un diagnostic ou d’une situation par le professionnel.</p></div>}

      {pathwayInfo ? <section className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]" aria-labelledby="roadmap-title">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-care">Feuille de route partagée</p><h2 id="roadmap-title" className="mt-1 text-2xl font-semibold text-foreground">Les étapes de votre parcours</h2></div><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-semibold text-foreground hover:border-care/40"><Printer aria-hidden="true" /> Imprimer</button></div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Les étapes suivantes restent visibles pour vous situer. Cliquez sur <strong className="font-semibold text-foreground">Préparer cette étape</strong> pour voir quoi faire. Seul votre professionnel confirme qu’une étape est réalisée.</p>
          <div className="mt-7 flex flex-col gap-3">
            {journeySteps.map((step) => { const isDone = completed.includes(step.id); const isNext = step.id === nextStep.id; return <div key={step.id} className={`rounded-2xl border p-4 ${isNext ? "border-care/40 bg-care/5" : "border-border bg-background"}`}><div className="flex gap-3"><span aria-hidden="true" className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border ${isDone ? "border-care bg-care text-primary-foreground" : "border-border bg-background text-muted-foreground"}`}>{isDone ? <Check /> : <span className="text-xs font-semibold">{step.label.replace("Étape ", "")}</span>}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{step.label}</span>{isNext ? <span className="rounded-full bg-care/15 px-2 py-0.5 text-xs font-semibold text-care">Prochaine étape</span> : null}</div><h3 className="mt-1 font-semibold text-foreground">{step.title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{step.description}</p><button type="button" onClick={() => { setActiveStepId(step.id); window.setTimeout(() => document.getElementById("step-detail")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); }} className={`mt-3 inline-flex min-h-10 items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${activeStep.id === step.id ? "bg-care text-primary-foreground" : "border border-border text-care hover:border-care/50"}`}>{activeStep.id === step.id ? "Étape sélectionnée" : "Préparer cette étape"}<ArrowRight aria-hidden="true" /></button></div></div></div>; })}
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div id="step-detail" tabIndex={-1} className="scroll-mt-6 rounded-3xl border border-care/25 bg-care/5 p-6"><p className="text-xs font-semibold uppercase tracking-wide text-care">Étape à préparer</p><h2 className="mt-2 text-xl font-semibold text-foreground">{activeStep.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{activeStep.id === nextStep.id && pathwayInfo ? `${pathwayInfo.next}. ` : "Vous consultez cette étape pour savoir comment vous y préparer. "}{activeStep.action}. Cette étape est à confirmer avec votre professionnel.</p><div className="mt-5 flex items-center gap-2 text-sm font-semibold text-care"><UserRound aria-hidden="true" /> Professionnel concerné à confirmer</div><div className="mt-6 border-t border-care/15 pt-5"><p className="text-sm font-semibold text-foreground">À préparer maintenant</p><div className="mt-3 flex flex-col gap-2">{preparationItems[activeStep.id].map((item) => { const key = `${activeStep.id}:${item}`; const isPrepared = preparedStepIds.includes(key); return <button key={item} type="button" onClick={() => setPreparedStepIds((current) => isPrepared ? current.filter((value) => value !== key) : [...current, key])} className="flex items-start gap-3 text-left text-sm leading-6 text-muted-foreground"><span aria-hidden="true" className={`mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border ${isPrepared ? "border-care bg-care text-primary-foreground" : "border-border bg-background"}`}>{isPrepared ? <Check /> : null}</span><span className={isPrepared ? "text-foreground line-through" : ""}>{item}</span></button>; })}</div><p className="mt-4 text-xs leading-5 text-muted-foreground">Ces repères vous aident à préparer l’échange. Ils ne valident pas une étape médicale.</p></div></div>
          <div className="rounded-3xl border border-border bg-card p-6"><div className="flex items-center gap-2"><FileText className="text-care" aria-hidden="true" /><h2 className="font-semibold text-foreground">Préparer le prochain échange</h2></div><label htmlFor="questions" className="mt-4 block text-sm font-medium text-foreground">Mes questions</label><textarea id="questions" value={questions} onChange={(event) => setQuestions(event.target.value)} rows={3} placeholder="Ce que je veux demander…" className="mt-2 w-full rounded-xl border border-input bg-background p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" /><label htmlFor="documents" className="mt-4 block text-sm font-medium text-foreground">Documents à retrouver</label><textarea id="documents" value={documents} onChange={(event) => setDocuments(event.target.value)} rows={3} placeholder="Résultat, compte rendu, ordonnance…" className="mt-2 w-full rounded-xl border border-input bg-background p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" /></div>
          <div className="rounded-3xl border border-border bg-background p-5"><div className="flex items-start gap-3"><HelpCircle className="mt-0.5 shrink-0 text-care" aria-hidden="true" /><p className="text-sm leading-6 text-muted-foreground">Kivoir organise vos informations. La prochaine étape et les consignes sont définies avec votre professionnel de santé.</p></div></div>
        </aside>
      </section> : null}

      <section className="mt-8 grid gap-4 sm:grid-cols-2"><a href="/conseils" className="rounded-2xl border border-border bg-card p-5 hover:border-care/40"><p className="font-semibold text-foreground">Voir les conseils généraux</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Des repères d’information à consulter en complément de votre accompagnement.</p></a><a href="/annuaire" className="rounded-2xl border border-border bg-card p-5 hover:border-care/40"><p className="font-semibold text-foreground">Retrouver les professionnels</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Consultez l’annuaire lorsque votre professionnel vous invite à poursuivre le parcours.</p></a></section>
      <div className="mt-10"><MedicalDisclaimer /></div>
    </main>
  );
}
