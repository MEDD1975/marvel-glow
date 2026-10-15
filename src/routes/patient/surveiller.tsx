import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Phone } from "lucide-react";
import { usePatient } from "@/components/patient/PatientProvider";
import { LoadingState, NoPathwayState, PageHeading } from "@/components/patient/PatientUi";
import { emergencyNumbers } from "@/lib/patient-guides";
import { contactCabinetLabel, formatPhone, phoneHref } from "@/lib/typography";

export const Route = createFileRoute("/patient/surveiller")({
  component: WarningPage,
});

function WarningPage() {
  const { ready, guide, cabinetName, cabinetPhone } = usePatient();
  if (!ready) return <LoadingState />;
  if (!guide) return <NoPathwayState />;
  const cabinetHref = phoneHref(cabinetPhone);
  return (
    <div>
      <PageHeading
        back={{ to: "/patient", label: "Accueil" }}
        title="Quand consulter rapidement"
        description="Contactez rapidement un professionnel de santé si vous présentez l'un des signes suivants."
      />
      <ul className="flex flex-col gap-2" aria-label="Signes à surveiller">
        {guide.warnings.map((warning) => (
          <li key={warning.id} className="flex items-start gap-3 rounded-xl border border-tone-orange-border/50 bg-tone-orange px-4 py-3 text-base leading-snug text-foreground">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-tone-orange-text" aria-hidden="true" />
            {warning.label}
          </li>
        ))}
      </ul>

      {cabinetHref ? (
        <a
          href={cabinetHref}
          className="mt-6 flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 font-semibold text-foreground hover:bg-accent"
        >
          <Phone className="h-5 w-5 text-care" aria-hidden="true" />
          {`${contactCabinetLabel(cabinetName)} · ${formatPhone(cabinetPhone) ?? ""}`}
        </a>
      ) : null}

      <section aria-labelledby="urgence-title" className="mt-6 rounded-2xl border border-tone-red-border/40 bg-tone-red p-4 text-tone-red-text">
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
    </div>
  );
}
