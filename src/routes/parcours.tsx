import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, PlayCircle } from "lucide-react";
import { MedicalDisclaimer } from "@/components/HomeBlocks";
import { LocalCareTimeline } from "@/components/LocalCareTimeline";
import { conditions } from "@/lib/conditions";

type ParcoursSearch = { pathway?: string };

export const Route = createFileRoute("/parcours")({
  validateSearch: (search: Record<string, unknown>): ParcoursSearch => ({ pathway: typeof search.pathway === "string" ? search.pathway : undefined }),
  head: () => ({ meta: [{ title: "Votre parcours de soin — Kivoir" }, { name: "description", content: "Notez les professionnels de votre parcours de soin et accédez aux conseils utiles." }] }),
  component: ParcoursPage,
});

function ParcoursPage() {
  const { pathway } = Route.useSearch();
  const condition = pathway ? conditions.find((item) => item.id === pathway) : undefined;

  return <main className="mx-auto max-w-5xl px-4 py-10 md:py-14">
    <section className="max-w-3xl"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-care">Kivoir · Mon parcours de soins</p><h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground md:text-6xl">Mon parcours de soins</h1><p className="mt-5 text-lg leading-8 text-muted-foreground">Notez les professionnels vus ou prévus, puis retrouvez facilement vos conseils et votre annuaire.</p></section>
    <LocalCareTimeline />
    <section className="mt-10 grid gap-4 sm:grid-cols-2" aria-label="Accès aux ressources patient">
      <Link to="/conseils" search={condition ? { c: condition.id } : undefined} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-care/40"><PlayCircle className="text-care" aria-hidden="true" /><span className="font-semibold text-foreground">Conseils et vidéos{condition ? ` pour ${condition.name.toLowerCase()}` : ""}</span></Link>
      <Link to="/annuaire" className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-care/40"><MapPin className="text-care" aria-hidden="true" /><span className="font-semibold text-foreground">Annuaire des professionnels</span></Link>
    </section>
    <div className="mt-10"><MedicalDisclaimer /></div>
  </main>;
}

export default Route;
