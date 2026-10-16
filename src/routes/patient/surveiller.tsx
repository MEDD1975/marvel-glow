import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, MessageCircle, Phone } from "lucide-react";
import { usePatient } from "@/components/patient/PatientProvider";
import { CompactLinks, PatientPageHeader } from "@/components/patient/PatientBlocks";
import { LoadingState, NoPathwayState } from "@/components/patient/PatientUi";
import { emergencyNumbers } from "@/lib/patient-guides";
import { contactCabinetLabel, formatPhone, phoneHref } from "@/lib/typography";

export const Route = createFileRoute("/patient/surveiller")({
  head: () => ({
    meta: [
      { title: "Ce que je dois surveiller — Kivoir" },
      { name: "description", content: "Les situations pour lesquelles demander un nouvel avis professionnel." },
    ],
  }),
  component: WarningPage,
});

function WarningPage() {
  const { ready, guide, cabinetName, cabinetPhone } = usePatient();
  const [open, setOpen] = useState(false);
  if (!ready) return <LoadingState />;
  if (!guide) return <NoPathwayState />;
  const cabinetHref = phoneHref(cabinetPhone);

  return (
    <div className="flex flex-col gap-8">
      <PatientPageHeader
        title="Ce que je dois surveiller"
        intro="Demandez rapidement un avis professionnel si vous observez l’un de ces signes ou si votre évolution vous inquiète."
        pathwayName={guide.name}
      />

      <section aria-label="Signes à surveiller">
        <ul className="flex flex-col gap-2">
          {guide.warnings.map((warning) => (
            <li key={warning.id} className="flex items-start gap-3 rounded-xl border border-tone-orange-border/40 bg-tone-orange/70 px-4 py-3 text-base leading-snug text-foreground">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-tone-orange-text" aria-hidden="true" />
              {warning.label}
            </li>
          ))}
        </ul>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="avis-options"
          onClick={() => setOpen((value) => !value)}
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          Demander un avis
        </button>

        {open ? (
          <div id="avis-options" className="mt-3 flex flex-col gap-3">
            {cabinetHref ? (
              <a href={cabinetHref} className="flex min-h-14 items-center gap-3 rounded-xl border border-border bg-card px-4 hover:bg-accent">
                <Phone className="h-5 w-5 shrink-0 text-care" aria-hidden="true" />
                <span>
                  <span className="block font-semibold text-foreground">{contactCabinetLabel(cabinetName)}</span>
                  <span className="block text-sm text-muted-foreground">{formatPhone(cabinetPhone)}</span>
                </span>
              </a>
            ) : (
              <p className="rounded-xl bg-muted px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                Aucun numéro de cabinet n&apos;a été transmis avec ce parcours. Contactez le professionnel de santé qui vous suit.
              </p>
            )}
          </div>
        ) : null}
      </section>

      <section aria-labelledby="urgence-title" className="rounded-2xl border border-tone-red-border/40 bg-tone-red p-4 text-tone-red-text">
        <h2 id="urgence-title" className="font-semibold">En cas d&apos;urgence ou de situation qui vous paraît grave</h2>
        <p className="mt-1 text-sm">Contactez les services d&apos;urgence : 15 ou 112.</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {emergencyNumbers.map((item) => (
            <a key={item.id} href={`tel:${item.number}`} className="flex min-h-14 flex-col items-center justify-center rounded-xl bg-card text-foreground">
              <span className="text-xl font-bold">{item.number}</span>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </a>
          ))}
        </div>
      </section>

      <CompactLinks links={[{ to: "/conseils", label: "Voir mes recommandations" }]} />
    </div>
  );
}
