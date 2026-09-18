import { createFileRoute } from "@tanstack/react-router";
import { AssistantHome, MedicalDisclaimer } from "@/components/HomeBlocks";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kivoir — Votre espace patient" },
      { name: "description", content: "Votre espace patient Kivoir : posez vos questions à l’Assistant, retrouvez vos conseils et consultez le réseau professionnel." },
      { property: "og:title", content: "Kivoir — Votre espace patient" },
      { property: "og:description", content: "Posez vos questions, retrouvez vos conseils et consultez le réseau professionnel avec Kivoir." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    started: search.started === true || search.started === "1",
    pathway: typeof search.pathway === "string" ? search.pathway : undefined,
  }),
  component: HomePage,
});

function HomePage() {
  const { started, pathway } = Route.useSearch();

  return (
    <main className="flex flex-col px-4 py-6 md:px-8 lg:py-8">
      <AssistantHome initialStarted={started || Boolean(pathway)} pathway={pathway} />
      <section className="mx-auto w-full max-w-6xl pb-8">
        <MedicalDisclaimer />
      </section>
    </main>
  );
}

