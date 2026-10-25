import { createFileRoute } from "@tanstack/react-router";
import { PatientLanding } from "@/components/PatientLanding";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kivoir — Qui voir, quand ? Orientation et parcours de soins" },
      { name: "description", content: "Kivoir vous aide à vous orienter en cas de douleur de la jambe, de la cheville ou du pied, et à retrouver les conseils transmis par votre professionnel de santé." },
      { property: "og:title", content: "Kivoir — Qui voir, quand ?" },
      { property: "og:description", content: "Orientation en cas de douleur et conseils transmis par votre professionnel de santé, entre deux rendez-vous." },
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
  const search = Route.useSearch();

  if (search.started || search.pathway || search.doctorName) {
    return <PatientLanding search={search} />;
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F7FAFE] px-6 text-center">
      <section className="max-w-md">
        <h1 className="text-2xl font-bold tracking-tight text-[#101C33]">Accès par QR code</h1>
        <p className="mt-3 text-base leading-relaxed text-[#526176]">
          Kivoir est accessible uniquement depuis le QR code remis par votre professionnel de santé.
        </p>
      </section>
    </main>
  );
}
