import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, ArrowRight, Clock, MapPin, Users } from "lucide-react";
import { MedicalDisclaimer } from "@/components/HomeBlocks";
import { conditions } from "@/lib/conditions";
import { lineLabels, pathways, type CareLine } from "@/lib/pathways";

type ParcoursSearch = { c?: string | undefined };

export const Route = createFileRoute("/parcours")({
  validateSearch: (search: Record<string, unknown>): ParcoursSearch => ({
    c: typeof search["c"] === "string" ? search["c"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Parcours de soin gradué — Kivoir" },
      {
        name: "description",
        content:
          "Pour chaque trouble du membre inférieur : quel professionnel voir en premier, lesquels prennent le relais, dans quel délai et quand passer au recours spécialisé.",
      },
      { property: "og:title", content: "Parcours de soin gradué — Kivoir" },
      {
        property: "og:description",
        content:
          "Le réseau de spécialistes autour de votre pathologie : 1re ligne, prise en charge spécialisée et recours, avec les délais.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ParcoursPage,
});

const lineClasses: Record<CareLine, string> = {
  1: "border-care/30 bg-care/5",
  2: "border-soothe/50 bg-soothe/20",
  3: "border-border bg-muted/50",
};

function ParcoursPage() {
  const { c } = Route.useSearch();
  const navigate = useNavigate({ from: "/parcours" });

  const selected = conditions.find((item) => item.id === c) ?? null;
  const pathway = selected ? pathways[selected.id] : undefined;
  const [situation, setSituation] = useState<string | null>(null);
  const situations = [
    { id: "start", title: "Je commence", detail: "Je ressens quelque chose et je ne sais pas par où commencer." },
    { id: "consultation", title: "J’ai consulté", detail: "Je veux comprendre ce qui vient après un rendez-vous." },
    { id: "exam", title: "J’ai un examen", detail: "Je veux savoir comment lire la suite de mon parcours." },
    { id: "rehab", title: "Je suis en rééducation", detail: "Je veux suivre les prochaines étapes et les relais utiles." },
  ];

  const select = (id: string | undefined) =>
    navigate({ search: { c: id }, resetScroll: false });

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-care">Votre parcours de soin</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">Où en êtes-vous aujourd’hui ?</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
        Kivoir vous aide à comprendre la prochaine étape, les informations à préparer et les professionnels qui peuvent vous accompagner.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {situations.map((item) => {
          const active = situation === item.id;
          return (
            <button key={item.id} type="button" onClick={() => setSituation(active ? null : item.id)} className={`min-h-32 rounded-3xl border p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm ${active ? "border-care bg-care/10" : "border-border bg-card"}`}>
              <span className="text-xl font-semibold text-foreground">{item.title}</span>
              <span className="mt-2 block text-base leading-7 text-muted-foreground">{item.detail}</span>
            </button>
          );
        })}
      </div>

      {situation ? <div className="mt-6 rounded-2xl border border-care/20 bg-care/5 p-5 text-base leading-7 text-foreground">Votre situation est un point de départ. Choisissez ensuite le sujet de soin concerné pour voir les étapes habituelles, sans interprétation médicale.</div> : null}

      <div className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Choisissez le sujet de votre parcours</h2>
        <p className="mt-2 text-base leading-7 text-muted-foreground">Les informations ci-dessous décrivent l’organisation des soins, pas un diagnostic.</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {conditions.map((item) => {
          const active = item.id === selected?.id;
          return (
            <button
              key={item.id}
              onClick={() => select(active ? undefined : item.id)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                active
                  ? "border-care bg-care text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-care/40 hover:text-foreground"
              }`}
            >
              {item.name}
            </button>
          );
        })}
      </div>

      {!selected || !pathway ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <Users className="mx-auto h-8 w-8 text-care" />
          <p className="mt-3 font-medium text-foreground">Sélectionnez un trouble ci-dessus</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Vous obtiendrez le parcours complet : professionnels de 1re ligne, spécialistes du suivi,
            recours en cas d'échec, chronologie et signaux qui doivent accélérer la prise en charge.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-card-foreground">{selected.name}</h2>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {selected.zone}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{selected.summary}</p>
            <p className="mt-4 flex items-start gap-2 rounded-xl border border-care/20 bg-care/5 p-3 text-sm text-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-care" />
              <span>
                <span className="font-medium">Première étape habituelle : </span>
                {pathway.entry}
              </span>
            </p>
            <div className="mt-5 rounded-2xl border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-care">À préparer pour votre prochain échange</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Notez vos symptômes, les étapes déjà réalisées, vos questions et les documents reçus.</p>
            </div>
          </div>

          {([1, 2, 3] as CareLine[]).map((line) => {
            const actors = pathway.actors.filter((actor) => actor.line === line);
            if (actors.length === 0) return null;
            return (
              <section key={line}>
                <h3 className="text-base font-semibold text-foreground">{lineLabels[line].label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{lineLabels[line].description}</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {actors.map((actor) => (
                    <div key={actor.role} className={`rounded-xl border p-4 ${lineClasses[line]}`}>
                      <p className="font-medium text-foreground">{actor.role}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{actor.mission}</p>
                      <p className="mt-3 flex items-start gap-2 text-sm text-foreground">
                        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-care" />
                        <span>{actor.trigger}</span>
                      </p>
                      <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Délai indicatif : {actor.delay}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}

          <section>
            <h3 className="text-base font-semibold text-foreground">Chronologie attendue</h3>
            <ol className="mt-3 space-y-3 border-l border-border pl-5">
              {pathway.milestones.map((milestone) => (
                <li key={milestone.period} className="relative">
                  <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-care bg-background" />
                  <p className="text-xs font-medium uppercase tracking-wide text-care">
                    {milestone.period}
                  </p>
                  <p className="font-medium text-foreground">{milestone.title}</p>
                  <p className="text-sm text-muted-foreground">{milestone.goal}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-2xl border border-urgent/20 bg-urgent/5 p-5">
            <h3 className="flex items-center gap-2 text-base font-semibold text-urgent">
              <AlertTriangle className="h-4 w-4" />
              Ce qui doit accélérer le parcours
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {pathway.escalation.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-urgent" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      <div className="mt-10">
        <MedicalDisclaimer />
      </div>
    </main>
  );
}
