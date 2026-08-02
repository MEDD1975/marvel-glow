import { createFileRoute } from "@tanstack/react-router";
import { HomeHero, EntryGrid, MedicalDisclaimer, type HomeSource } from "@/components/HomeBlocks";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { src: HomeSource } => {
    const raw = String(search["src"] ?? "");
    return { src: raw === "affiche" || raw === "carte" ? raw : "direct" };
  },
  head: () => ({
    meta: [
      { title: "Kivoir — Qui voir, quand : douleurs du membre inférieur" },
      { name: "description", content: "Genou, cheville, hanche, pied : identifiez votre trouble, sachez qui consulter, dans quel ordre et dans quel délai." },
      { property: "og:title", content: "Kivoir — Qui voir, quand : douleurs du membre inférieur" },
      { property: "og:description", content: "Genou, cheville, hanche, pied : identifiez votre trouble, sachez qui consulter, dans quel ordre et dans quel délai." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { src } = Route.useSearch();

  return (
    <main>
      <HomeHero source={src} />
      <EntryGrid />
      <section className="mx-auto max-w-4xl px-4 pb-16">
        <MedicalDisclaimer />
      </section>
    </main>
  );
}

