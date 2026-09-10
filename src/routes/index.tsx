import { createFileRoute } from "@tanstack/react-router";
import { AssistantHome, MedicalDisclaimer } from "@/components/HomeBlocks";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kivoir — Votre espace patient" },
      { name: "description", content: "Votre espace patient Kivoir : posez vos questions à l’Assistant, retrouvez vos conseils et trouvez le bon professionnel de la CPTS." },
      { property: "og:title", content: "Kivoir — Votre espace patient" },
      { property: "og:description", content: "Posez vos questions, retrouvez vos conseils et trouvez le bon professionnel avec Kivoir." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    started: search.started === "1",
  }),
  component: HomePage,
});

function HomePage() {
  const { started } = Route.useSearch();

  return (
    <main>
      <AssistantHome initialStarted={started} />
      <section className="mx-auto max-w-4xl px-4 pb-16">
        <MedicalDisclaimer />
      </section>
    </main>
  );
}

