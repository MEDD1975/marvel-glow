import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Info, Thermometer, User, Users } from "lucide-react";
import { MedicalDisclaimer } from "@/components/HomeBlocks";
import { dailyTips, redFlags, professionals } from "@/lib/care-data";

export const Route = createFileRoute("/conseils")({
  head: () => ({
    meta: [
      { title: "Conseils pratiques — ChevilleClaire" },
      { name: "description", content: "Conseils quotidiens, signes d'alerte et guide des professionnels de santé pour une entorse de cheville." },
      { property: "og:title", content: "Conseils pratiques — ChevilleClaire" },
      { property: "og:description", content: "Conseils quotidiens, signes d'alerte et guide des professionnels de santé pour une entorse de cheville." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConseilsPage,
});

function ConseilsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Conseils pratiques</h1>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            Les bons réflexes au quotidien, les signes qui doivent alerter et les professionnels à consulter selon le moment.
          </p>
        </div>

        <section className="mt-10">
          <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Thermometer className="h-5 w-5 text-care" />
            Les bons réflexes du quotidien
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dailyTips.map((tip, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="font-semibold text-card-foreground">{tip.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{tip.content}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <AlertTriangle className="h-5 w-5 text-urgent" />
            Signes d'alerte : consultez rapidement
          </div>
          <div className="mt-4 rounded-2xl border border-urgent/20 bg-urgent/5 p-6">
            <ul className="grid gap-3 sm:grid-cols-2">
              {redFlags.map((flag, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-urgent" />
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Users className="h-5 w-5 text-care" />
            Qui consulter et quand
          </div>
          <div className="mt-4 space-y-3">
            {professionals.map((pro, i) => (
              <div key={i} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-care/10 text-care">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground">{pro.role}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{pro.when}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 shrink-0 text-care" />
            <div>
              <h3 className="font-semibold text-card-foreground">Pour les professionnels de santé</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Ce parcours est conçu comme un support pédagogique pour les patients. Il peut être complété ou adapté selon les protocoles de votre établissement ou de votre spécialité.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-10">
          <MedicalDisclaimer />
        </div>
      </main>
    </div>
  );
}
