import { createFileRoute } from "@tanstack/react-router";
import { PatientLanding } from "@/components/PatientLanding";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kivoir — Votre espace patient" },
      { name: "description", content: "Votre espace patient Kivoir : retrouvez votre suivi, vos conseils et les professionnels recommandés par votre médecin." },
      { property: "og:title", content: "Kivoir — Votre espace patient" },
      { property: "og:description", content: "Retrouvez votre suivi, vos conseils et les professionnels recommandés avec Kivoir." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { started: boolean; pathway?: string | undefined; doctorName?: string | undefined } => ({
    started: search["started"] === true || search["started"] === "1",
    pathway: typeof search["pathway"] === "string" ? search["pathway"] : undefined,
    doctorName: typeof search["doctorName"] === "string" ? search["doctorName"] : undefined,
  }),
  component: HomePage,
});

function HomePage() {
  const { pathway, doctorName } = Route.useSearch();

  return (
    <main className="mx-auto w-full max-w-md px-4 pt-6 pb-12 md:max-w-xl">
      <PatientLanding {...(pathway ? { pathway } : {})} {...(doctorName ? { doctorName } : {})} />
    </main>
  );
}
