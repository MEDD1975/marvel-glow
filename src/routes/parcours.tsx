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
  { id: "consultation", label: "Étape 1", title: "Échange avec un professionnel", description: "Présentez ce qui vous amène et partagez vos questions.", action: "Préparer mes questions" },
  { id: "documents", label: "Étape 2", title: "Examens et documents", description: "Rassemblez les résultats, comptes rendus et consignes déjà reçus.", action: "Rassembler mes documents" },
  { id: "care", label: "Étape 3", title: "Prise en charge", description: "Suivez les consignes de votre professionnel et notez ce qui reste à faire.", action: "Noter ma prochaine action" },
  { id: "follow-up", label: "Étape 4", title: "Point de suivi", description: "Préparez le prochain échange avec les éléments observés et vos nouvelles questions.", action: "Préparer mon suivi" },
];

const situations = [
  { id: "start", title: "Je commence mon parcours", detail: "Je ne sais pas encore quelle est la première étape.", completed: [] as string[], next: "Commencer par préparer votre échange" },
  { id: "accompanied", title: "Je suis déjà accompagné", detail: "J’ai rencontré un professionnel et je veux retrouver la suite.", completed: ["consultation"], next: "Rassembler les éléments de votre dernière consultation" },
  { id: "exam", title: "J’ai un examen ou un document", detail: "Je veux organiser ce que j’ai reçu et préparer la suite.", completed: ["consultation", "documents"], next: "Préparer l’échange autour de vos résultats" },
  { id: "follow-up", title: "Je suis en suivi", detail: "Je veux garder une vue claire des prochaines étapes.", completed: ["consultation", "documents", "care"], next: "Préparer votre prochain point de suivi" },
];

type ParcoursSearch = { situation?: string };

export const Route = createFileRoute("/parcours")({
  validateSearch: (search: Record<string, unknown>): ParcoursSearch => ({
    situation: typeof search.situation === "string" ? search.situation : undefined,
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
  const { situation: incomingSituation } = Route.useSearch();
  const initialSituation = situations.some((item) => item.id === incomingSituation) ? incomingSituation ?? "" : "";
  const [situation, setSituation] = useState(initialSituation);
  const [completed, setCompleted] = useState<string[]>(situations.find((item) => item.id === initialSituation)?.completed ?? []);
  const selectedSituation = situations.find((item) => item.id === situation) ?? null;
  const [questions, setQuestions] = useState("");
  const [documents, setDocuments] = useState("");

  const nextStep = useMemo(() => journeySteps.find((step) => !completed.includes(step.id)) ?? journeySteps[journeySteps.length - 1], [completed]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-care">Kivoir · Qui voir, quand</p>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground md:text-6xl">Votre parcours de soin, enfin lisible.</h1>
        <p className="mt-5 text-pretty text-lg leading-8 text-muted-foreground">Le médecin vous accompagne. Kivoir vous aide à retrouver ce qui a été fait, ce qui vient ensuite et ce qu’il faut préparer.</p>
      </section>

      {!incomingSituation ? <section className="mt-10" aria-labelledby="situation-title">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold text-care">Point de départ</p><h2 id="situation-title" className="mt-1 text-2xl font-semibold text-foreground">Choisissez votre situation</h2></div><span className="text-sm text-muted-foreground">Aucune réponse médicale à déduire</span></div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Choisissez une seule réponse pour personnaliser la feuille de route. Ce choix ne constitue pas une évaluation médicale.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-labelledby="situation-title">
          {situations.map((item) => { const isSelected = situation === item.id; return <button key={item.id} type="button" onClick={() => { setSituation(item.id); setCompleted(item.completed); }} role="radio" aria-checked={isSelected} className={`rounded-2xl border p-5 text-left transition ${isSelected ? "border-care bg-care/10 ring-2 ring-care/30" : "border-border bg-card hover:border-care/40"}`}><span className="flex items-start gap-3"><span aria-hidden="true" className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${isSelected ? "border-care" : "border-muted-foreground/40"}`}><span className={isSelected ? "size-2.5 rounded-full bg-care" : "size-0"} /></span><span><span className="font-semibold text-foreground">{item.title}</span><span className="mt-1 block text-sm leading-6 text-muted-foreground">{item.detail}</span></span></span>{isSelected ? <span className="mt-4 block text-xs font-semibold uppercase tracking-wide text-care">Sélectionné</span> : null}</button>; })}
        </div>
      </section> : <div className="mt-10 rounded-2xl border border-care/20 bg-care/5 px-5 py-4 text-sm text-muted-foreground"><span className="font-semibold text-foreground">Votre choix :</span> {selectedSituation?.title}</div>}

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]" aria-labelledby="roadmap-title">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-care">Feuille de route partagée</p><h2 id="roadmap-title" className="mt-1 text-2xl font-semibold text-foreground">Les étapes de votre parcours</h2></div><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-semibold text-foreground hover:border-care/40"><Printer aria-hidden="true" /> Imprimer</button></div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Les étapes sont proposées comme repères. Votre professionnel confirme la suite ; vous ne pouvez pas les valider ou les modifier ici.</p>
          <div className="mt-7 flex flex-col gap-3">
            {journeySteps.map((step) => { const isDone = completed.includes(step.id); const isNext = step.id === nextStep.id; return <div key={step.id} className={`rounded-2xl border p-4 ${isNext ? "border-care/40 bg-care/5" : "border-border bg-background"}`}><div className="flex gap-3"><span aria-hidden="true" className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border ${isDone ? "border-care bg-care text-primary-foreground" : "border-border bg-background text-muted-foreground"}`}>{isDone ? <Check /> : <span className="text-xs font-semibold">{step.label.replace("Étape ", "")}</span>}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{step.label}</span>{isNext ? <span className="rounded-full bg-care/15 px-2 py-0.5 text-xs font-semibold text-care">Prochaine étape</span> : null}</div><h3 className="mt-1 font-semibold text-foreground">{step.title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{step.description}</p></div></div></div>; })}
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-3xl border border-care/25 bg-care/5 p-6"><p className="text-xs font-semibold uppercase tracking-wide text-care">À faire maintenant</p><h2 className="mt-2 text-xl font-semibold text-foreground">{nextStep.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{selectedSituation ? `${selectedSituation.next}. ` : "Sélectionnez votre situation pour personnaliser cette recommandation. "}{nextStep.action}. Cette étape est à confirmer avec votre professionnel.</p><div className="mt-5 flex items-center gap-2 text-sm font-semibold text-care"><UserRound aria-hidden="true" /> Professionnel concerné à confirmer</div></div>
          <div className="rounded-3xl border border-border bg-card p-6"><div className="flex items-center gap-2"><FileText className="text-care" aria-hidden="true" /><h2 className="font-semibold text-foreground">Préparer le prochain échange</h2></div><label htmlFor="questions" className="mt-4 block text-sm font-medium text-foreground">Mes questions</label><textarea id="questions" value={questions} onChange={(event) => setQuestions(event.target.value)} rows={3} placeholder="Ce que je veux demander…" className="mt-2 w-full rounded-xl border border-input bg-background p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" /><label htmlFor="documents" className="mt-4 block text-sm font-medium text-foreground">Documents à retrouver</label><textarea id="documents" value={documents} onChange={(event) => setDocuments(event.target.value)} rows={3} placeholder="Résultat, compte rendu, ordonnance…" className="mt-2 w-full rounded-xl border border-input bg-background p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" /></div>
          <div className="rounded-3xl border border-border bg-background p-5"><div className="flex items-start gap-3"><HelpCircle className="mt-0.5 shrink-0 text-care" aria-hidden="true" /><p className="text-sm leading-6 text-muted-foreground">Kivoir organise vos informations. La prochaine étape et les consignes sont définies avec votre professionnel de santé.</p></div></div>
        </aside>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2"><a href="/conseils" className="rounded-2xl border border-border bg-card p-5 hover:border-care/40"><p className="font-semibold text-foreground">Voir les conseils généraux</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Des repères d’information à consulter en complément de votre accompagnement.</p></a><a href="/annuaire" className="rounded-2xl border border-border bg-card p-5 hover:border-care/40"><p className="font-semibold text-foreground">Retrouver les professionnels</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Consultez l’annuaire lorsque votre professionnel vous invite à poursuivre le parcours.</p></a></section>
      <div className="mt-10"><MedicalDisclaimer /></div>
    </main>
  );
}
