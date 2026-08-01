import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { MedicalDisclaimer } from "@/components/HomeBlocks";
import { pathwayStages } from "@/lib/care-data";

export const Route = createFileRoute("/parcours")({
  head: () => ({
    meta: [
      { title: "Parcours de soins — ChevilleClaire" },
      { name: "description", content: "La chronologie type d'une entorse de cheville : phase aiguë, sous-aiguë, rééducation et retour à l'activité." },
      { property: "og:title", content: "Parcours de soins — ChevilleClaire" },
      { property: "og:description", content: "La chronologie type d'une entorse de cheville : phase aiguë, sous-aiguë, rééducation et retour à l'activité." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ParcoursPage,
});

function ParcoursPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Parcours de soins type</h1>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            Chaque entorse est différente, mais voici les grandes étapes qui guident la récupération. Votre médecin ou kinésithérapeute adapte ce parcours à votre situation.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          {pathwayStages.map((stage, index) => (
            <div
              key={stage.id}
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8"
            >
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-care to-soothe" />
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-care/10 text-care">
                  <span className="text-lg font-semibold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-card-foreground">{stage.title}</h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {stage.days}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-care">{stage.goal}</p>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-care" />
                        À faire
                      </h3>
                      <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                        {stage.do.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-care" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <XCircle className="h-4 w-4 text-urgent" />
                        À éviter
                      </h3>
                      <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                        {stage.avoid.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-urgent" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-muted p-3 text-sm">
                    <span className="font-medium text-foreground">Qui consulter :</span>{" "}
                    <span className="text-muted-foreground">{stage.see}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <MedicalDisclaimer />
        </div>
      </main>
    </div>
  );
}
