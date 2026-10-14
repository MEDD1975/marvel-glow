import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, FileText, Globe } from "lucide-react";
import { useDoctorResources, usePatient } from "@/components/patient/PatientProvider";
import { EmptyState, ErrorState, LoadingState, NoPathwayState, PageHeading, SectionTitle } from "@/components/patient/PatientUi";
import { formatDate, formatTitle } from "@/lib/typography";

export const Route = createFileRoute("/patient/ressources/documents")({
  component: DocumentsPage,
});

function ExternalRow({ href, title, meta, icon }: { href: string; title: string; meta: string | undefined; icon: React.ReactNode }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-16 items-center gap-3 px-4 py-3 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tone-blue text-care">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium text-foreground">{title}</span>
          {meta ? <span className="mt-0.5 block text-sm text-muted-foreground">{meta}</span> : null}
        </span>
        <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="sr-only">(ouvre un nouvel onglet)</span>
      </a>
    </li>
  );
}

function DocumentsPage() {
  const { ready, guide } = usePatient();
  const resources = useDoctorResources();
  if (!ready) return <LoadingState />;
  if (!guide) return <NoPathwayState />;
  const documents = (resources.data ?? []).filter((item) => !item.contentType?.startsWith("video/"));
  return (
    <div>
      <PageHeading back={{ to: "/patient/ressources", label: "Mes ressources" }} title="Documents" />
      <SectionTitle>Transmis par votre cabinet</SectionTitle>
      {resources.isLoading ? (
        <LoadingState label="Chargement des documents…" />
      ) : resources.isError ? (
        <ErrorState message="Les documents n'ont pas pu être chargés." onRetry={() => void resources.refetch()} />
      ) : documents.length ? (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {documents.map((item) => (
            <ExternalRow
              key={item.id}
              href={item.url}
              title={formatTitle(item.title)}
              meta={[item.contentType === "application/pdf" ? "PDF" : "Document", formatDate(item.createdAt)].filter(Boolean).join(" · ")}
              icon={<FileText className="h-5 w-5" aria-hidden="true" />}
            />
          ))}
        </ul>
      ) : (
        <EmptyState title="Aucun document transmis" description="Votre cabinet n'a pas encore partagé de document pour ce parcours." />
      )}

      {guide.sources.length ? (
        <>
          <SectionTitle>Sources officielles</SectionTitle>
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {guide.sources.map((item) => (
              <ExternalRow key={item.url} href={item.url} title={formatTitle(item.label)} meta={item.source} icon={<Globe className="h-5 w-5" aria-hidden="true" />} />
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
