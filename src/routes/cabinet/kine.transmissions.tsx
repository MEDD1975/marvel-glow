import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock3 } from "lucide-react";

export const Route = createFileRoute("/cabinet/kine/transmissions")({
  head: () => ({ meta: [{ title: "Mes transmissions kiné — Kivoir" }] }),
  component: KineTransmissionsPage,
});

const recentTransmissions = [
  {
    patient: "Patient transmis par le cabinet",
    focus: "Entorse de cheville",
    date: "Aujourd’hui",
    count: "4 contenus",
  },
  {
    patient: "Nouvelle transmission",
    focus: "Reprise progressive de l’appui",
    date: "Hier",
    count: "3 contenus",
  },
];

function KineTransmissionsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-7 px-4 py-6 md:px-8 md:py-9">
      <Link
        to="/cabinet/kine"
        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:bg-muted"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Retour à l’espace kiné
      </Link>

      <header className="rounded-3xl border border-[#cfe2d5] bg-[#eaf4ed] p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#177e78]">
          Le fil de vos séances
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#19392f] md:text-4xl">
          Mes transmissions
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#49685d] md:text-base">
          Retrouvez ici les parcours partagés avec vos patients.
        </p>
      </header>

      <section aria-labelledby="transmission-history-title">
        <div className="mb-4 flex items-center gap-2">
          <Clock3 className="h-5 w-5 text-[#177e78]" aria-hidden="true" />
          <h2 id="transmission-history-title" className="text-xl font-bold text-foreground">
            Historique
          </h2>
        </div>
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card px-5 shadow-sm">
          {recentTransmissions.map((item) => (
            <li
              key={`${item.focus}-${item.date}`}
              className="flex flex-wrap items-center justify-between gap-4 py-5 first:pt-5 last:pb-5"
            >
              <div>
                <p className="font-semibold text-foreground">{item.focus}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.patient} · {item.count}
                </p>
              </div>
              <span className="text-sm text-muted-foreground">{item.date}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
