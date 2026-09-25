import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, MapPin, PlayCircle } from "lucide-react";
import { MedicalDisclaimer } from "@/components/HomeBlocks";
import { LocalCareTimeline } from "@/components/LocalCareTimeline";
import { pathways } from "@/lib/pathways";
import { conditions } from "@/lib/conditions";

type ParcoursSearch = { pathway?: string };

export const Route = createFileRoute("/parcours")({
  validateSearch: (search: Record<string, unknown>): ParcoursSearch => ({ pathway: typeof search.pathway === "string" ? search.pathway : undefined }),
  head: () => ({ meta: [{ title: "Votre parcours de soin — Kivoir" }, { name: "description", content: "Retrouvez les étapes de votre parcours de soin." }] }),
  component: ParcoursPage,
});

function ParcoursPage() {
  const { pathway } = Route.useSearch();
  const condition = pathway ? conditions.find((item) => item.id === pathway) : undefined;
  const carePathway = pathway ? pathways[pathway] : undefined;

  return <main className="mx-auto max-w-5xl px-4 py-10 md:py-14">
    <section className="max-w-3xl"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-care">Kivoir · Qui voir, quand</p><h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground md:text-6xl">Votre parcours de soin, enfin lisible.</h1><p className="mt-5 text-lg leading-8 text-muted-foreground">Retrouvez les étapes de votre parcours, les professionnels à consulter et les bons repères.</p></section>
    <LocalCareTimeline />
    {condition && carePathway && <section className="mt-10"><div className="rounded-2xl border border-care/25 bg-care/5 px-5 py-5"><p className="text-xs font-semibold uppercase tracking-wide text-care">Parcours confirmé par votre professionnel</p><h2 className="mt-2 text-xl font-semibold text-foreground">{condition.name}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{condition.summary}</p><p className="mt-3 flex items-start gap-2 rounded-xl bg-card px-3 py-2 text-sm leading-6 text-foreground"><MapPin className="mt-0.5 shrink-0 text-care" aria-hidden="true" /><span><span className="font-semibold">Par où commencer : </span>{carePathway.entry}</span></p></div><div className="mt-10 flex items-center gap-2"><Clock className="text-care" aria-hidden="true" /><h2 className="text-2xl font-semibold text-foreground">Les étapes, dans l’ordre</h2></div><ol className="mt-6 flex flex-col gap-3">{carePathway.milestones.map((milestone, index) => <li key={milestone.title} className="flex gap-4 rounded-2xl border border-border bg-card p-4"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-care/10 text-sm font-semibold text-care">{index + 1}</span><div><p className="text-xs font-semibold uppercase tracking-wide text-care">{milestone.period}</p><h3 className="font-semibold text-foreground">{milestone.title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{milestone.goal}</p></div></li>)}</ol><div className="mt-8 grid gap-4 sm:grid-cols-2"><Link to="/conseils" search={{ c: condition.id }} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 hover:border-care/40"><PlayCircle className="text-care" aria-hidden="true" /><span className="font-semibold text-foreground">Conseils et vidéos pour {condition.name.toLowerCase()}</span></Link><Link to="/annuaire" className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 hover:border-care/40"><MapPin className="text-care" aria-hidden="true" /><span className="font-semibold text-foreground">Trouver les professionnels près de chez vous</span></Link></div></section>}
    <div className="mt-10"><MedicalDisclaimer /></div>
  </main>;
}
