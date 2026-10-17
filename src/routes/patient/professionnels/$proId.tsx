import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { useProfessionals } from "@/components/patient/PatientProvider";
import { EmptyState, FreeChoiceNotice, LoadingState, PageHeading } from "@/components/patient/PatientUi";
import { formatPhone, mapsHref, phoneHref } from "@/lib/typography";

export const Route = createFileRoute("/patient/professionnels/$proId")({
  component: ProfessionalDetail,
});

function ProfessionalDetail() {
  const { proId } = Route.useParams();
  const { isLoading, professionals } = useProfessionals();
  if (isLoading) return <LoadingState />;
  const item = professionals.find((pro) => pro.id === proId);
  if (!item) {
    return <EmptyState title="Professionnel introuvable" action={<Link className="font-semibold text-care" to="/patient/professionnels">Voir la liste</Link>} />;
  }
  const tel = phoneHref(item.phone);
  const maps = mapsHref(item.address);
  return (
    <article>
      <PageHeading back={{ to: "/patient/professionnels", label: "Professionnels" }} title={item.name} description={item.specialty} />
      <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {item.address ? (
          <div className="flex items-start gap-3 px-4 py-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div>
              <dt className="text-sm text-muted-foreground">Adresse</dt>
              <dd className="text-base text-foreground">{item.address}</dd>
            </div>
          </div>
        ) : null}
        {item.phone ? (
          <div className="flex items-start gap-3 px-4 py-3">
            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div>
              <dt className="text-sm text-muted-foreground">Téléphone</dt>
              <dd className="text-base tabular-nums text-foreground">{formatPhone(item.phone)}</dd>
            </div>
          </div>
        ) : null}
        {item.email ? (
          <div className="flex items-start gap-3 px-4 py-3">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="text-sm text-muted-foreground">E-mail</dt>
              <dd className="break-words text-base text-foreground">{item.email}</dd>
            </div>
          </div>
        ) : null}
      </dl>
      <div className="mt-5 flex flex-col gap-3">
        {tel ? (
          <a href={tel} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90">
            <Phone className="h-5 w-5" aria-hidden="true" />
            Appeler
          </a>
        ) : null}
        {maps ? (
          <a href={maps} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 font-semibold text-foreground hover:bg-accent">
            <MapPin className="h-5 w-5" aria-hidden="true" />
            Voir l&apos;itin&eacute;raire
          </a>
        ) : null}
        {item.email ? (
          <a href={`mailto:${item.email}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 font-semibold text-foreground hover:bg-accent">
            <Mail className="h-5 w-5" aria-hidden="true" />
            Écrire un e-mail
          </a>
        ) : null}
      </div>
      <FreeChoiceNotice />
    </article>
  );
}
