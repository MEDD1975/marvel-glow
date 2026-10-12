import { Link } from "@tanstack/react-router";
import { conditions } from "@/lib/conditions";

export function ParcoursPageContent({ pathway }: { pathway: string }) {
  const condition = conditions.find((item) => item.id === pathway);
  return <main className="mx-auto max-w-4xl px-4 py-12">
    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-care">Kivoir · Parcours patient</p>
    <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">{condition?.name ?? "Parcours de soins"}</h1>
    <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Retrouvez les ressources utiles et les informations de santé proposées par votre professionnel.</p>
    <div className="mt-8 flex flex-wrap gap-3">
      <Link to="/conseils" search={{ c: pathway }} className="rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground">Voir les conseils</Link>
      <Link to="/parcours" search={{ pathway }} className="rounded-xl border border-border bg-card px-4 py-2.5 font-semibold text-foreground">Mon parcours de soins</Link>
    </div>
  </main>;
}
