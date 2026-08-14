import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, ArrowRight, Clock, FileText, MapPin, PlayCircle, Printer, Stethoscope } from "lucide-react";
import { MedicalDisclaimer } from "@/components/HomeBlocks";
import { pathways, lineLabels, type CareLine } from "@/lib/pathways";
import { conditions } from "@/lib/conditions";

type ParcoursSearch = { pathway?: string };

export const Route = createFileRoute("/parcours")({
  validateSearch: (search: Record<string, unknown>): ParcoursSearch => ({
    pathway: typeof search.pathway === "string" ? search.pathway : undefined,
  }),
  head: () => ({ meta: [
    { title: "Votre parcours de soin — Kivoir" },
    { name: "description", content: "Qui consulter, dans quel ordre et à quel moment : le parcours de soin adapté au diagnostic confirmé par votre professionnel." },
    { property: "og:title", content: "Votre parcours de soin — Kivoir" },
    { property: "og:description", content: "Qui consulter, dans quel ordre et à quel moment, selon le diagnostic confirmé par votre professionnel." },
  ] }),
  component: ParcoursPage,
});

const careLines: CareLine[] = [1, 2, 3];

function ParcoursPage() {
  const { pathway } = Route.useSearch();
  const condition = pathway ? conditions.find((item) => item.id === pathway) ?? null : null;
  const carePathway = pathway ? pathways[pathway] ?? null : null;
  const [questions, setQuestions] = useState("");
  const [documents, setDocuments] = useState("");

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-care">Kivoir · Qui voir, quand</p>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground md:text-6xl">Votre parcours de soin, enfin lisible.</h1>
        <p className="mt-5 text-pretty text-lg leading-8 text-muted-foreground">Une fois le diagnostic confirmé par votre professionnel, retrouvez qui consulter, dans quel ordre et à quel moment.</p>
      </section>

      {!condition || !carePathway ? (
        <div className="mt-10 rounded-2xl border border-border bg-card px-5 py-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Parcours non attribué</p>
          <p className="mt-2 text-lg font-semibold text-foreground">Ouvrez le lien remis par votre professionnel de santé</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Le parcours s’affiche ici après confirmation d’un diagnostic. Kivoir organise les étapes, il ne pose pas le diagnostic.</p>
          <Link to="/conseils" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-care">Consulter les repères généraux <ArrowRight aria-hidden="true" /></Link>
        </div>
      ) : (
        <>
          <div className="mt-10 rounded-2xl border border-care/25 bg-care/5 px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-care">Parcours confirmé par votre professionnel</p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xl font-semibold text-foreground">{condition.name}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{condition.summary}</p>
              </div>
              <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full border border-care/40 bg-card px-3 py-2 text-sm font-semibold text-care hover:bg-care/10 print:hidden"><Printer aria-hidden="true" /> Imprimer</button>
            </div>
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-card px-3 py-2 text-sm leading-6 text-foreground"><MapPin className="mt-0.5 shrink-0 text-care" aria-hidden="true" /><span><span className="font-semibold">Par où commencer&nbsp;:</span> {carePathway.entry}</span></p>
          </div>

          {/* Timeline chronologique */}
          <section className="mt-10" aria-labelledby="timeline-title">
            <div className="flex items-center gap-2"><Clock className="text-care" aria-hidden="true" /><h2 id="timeline-title" className="text-2xl font-semibold text-foreground">Les étapes, dans l’ordre</h2></div>
            <ol className="mt-6 flex flex-col gap-3">
              {carePathway.milestones.map((milestone, index) => (
                <li key={milestone.title} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
                  <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-care/10 text-sm font-semibold text-care">{index + 1}</span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2"><span className="text-xs font-semibold uppercase tracking-wide text-care">{milestone.period}</span><h3 className="font-semibold text-foreground">{milestone.title}</h3></div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{milestone.goal}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Réseau de professionnels par ligne de recours */}
          <section className="mt-12" aria-labelledby="actors-title">
            <div className="flex items-center gap-2"><Stethoscope className="text-care" aria-hidden="true" /><h2 id="actors-title" className="text-2xl font-semibold text-foreground">Qui consulter</h2></div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Les professionnels sont classés par ordre de recours. Consultez d’abord la 1re ligne ; les lignes suivantes n’interviennent que si nécessaire.</p>
            <div className="mt-6 flex flex-col gap-6">
              {careLines.map((line) => {
                const actors = carePathway.actors.filter((actor) => actor.line === line);
                if (actors.length === 0) return null;
                return (
                  <div key={line}>
                    <div className="mb-3"><h3 className="text-sm font-semibold text-foreground">{lineLabels[line].label}</h3><p className="text-xs leading-5 text-muted-foreground">{lineLabels[line].description}</p></div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {actors.map((actor) => (
                        <div key={actor.role} className="rounded-2xl border border-border bg-card p-4">
                          <p className="font-semibold text-foreground">{actor.role}</p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">{actor.mission}</p>
                          <dl className="mt-3 flex flex-col gap-1.5 text-xs leading-5">
                            <div className="flex gap-2"><dt className="shrink-0 font-semibold text-care">Quand&nbsp;:</dt><dd className="text-muted-foreground">{actor.trigger}</dd></div>
                            <div className="flex gap-2"><dt className="shrink-0 font-semibold text-care">Délai&nbsp;:</dt><dd className="text-muted-foreground">{actor.delay}</dd></div>
                          </dl>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Signaux d'escalade */}
          <section className="mt-12 rounded-3xl border border-destructive/30 bg-destructive/5 p-6" aria-labelledby="escalation-title">
            <div className="flex items-center gap-2"><AlertTriangle className="text-destructive" aria-hidden="true" /><h2 id="escalation-title" className="text-xl font-semibold text-foreground">Quand consulter plus vite</h2></div>
            <ul className="mt-4 flex flex-col gap-2">
              {carePathway.escalation.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm leading-6 text-foreground"><span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-destructive" />{item}</li>
              ))}
            </ul>
          </section>

          {/* Préparer le prochain échange */}
          <section className="mt-12 rounded-3xl border border-border bg-card p-6 md:p-8" aria-labelledby="prepare-title">
            <div className="flex items-center gap-2"><FileText className="text-care" aria-hidden="true" /><h2 id="prepare-title" className="text-xl font-semibold text-foreground">Préparer votre prochain rendez-vous</h2></div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="questions" className="block text-sm font-medium text-foreground">Mes questions</label>
                <textarea id="questions" value={questions} onChange={(event) => setQuestions(event.target.value)} rows={4} placeholder="Ce que je veux demander…" className="mt-2 w-full rounded-xl border border-input bg-background p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label htmlFor="documents" className="block text-sm font-medium text-foreground">Documents à apporter</label>
                <textarea id="documents" value={documents} onChange={(event) => setDocuments(event.target.value)} rows={4} placeholder="Résultat, compte rendu, ordonnance…" className="mt-2 w-full rounded-xl border border-input bg-background p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
          </section>

          {/* Ressources rattachées au parcours */}
          <section className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link to="/conseils" search={{ c: condition.id }} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 hover:border-care/40">
              <PlayCircle className="mt-0.5 shrink-0 text-care" aria-hidden="true" />
              <span><span className="block font-semibold text-foreground">Conseils et vidéos pour {condition.name.toLowerCase()}</span><span className="mt-1 block text-sm leading-6 text-muted-foreground">Bons réflexes, exercices et erreurs à éviter, adaptés à votre situation.</span></span>
            </Link>
            <Link to="/annuaire" className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 hover:border-care/40">
              <MapPin className="mt-0.5 shrink-0 text-care" aria-hidden="true" />
              <span><span className="block font-semibold text-foreground">Trouver les professionnels près de chez vous</span><span className="mt-1 block text-sm leading-6 text-muted-foreground">Repérez les professionnels correspondant à chaque étape du parcours.</span></span>
            </Link>
          </section>
        </>
      )}

      <div className="mt-10"><MedicalDisclaimer /></div>
    </main>
  );
}
