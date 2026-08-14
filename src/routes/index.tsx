import { createFileRoute } from "@tanstack/react-router";
import { HomeHero, EntryGrid, MedicalDisclaimer } from "@/components/HomeBlocks";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kivoir — Qui voir, quand : douleurs du membre inférieur" },
      { name: "description", content: "Genou, cheville, hanche, pied : après le diagnostic de votre professionnel, sachez qui consulter, dans quel ordre et dans quel délai." },
      { property: "og:title", content: "Kivoir — Qui voir, quand : douleurs du membre inférieur" },
      { property: "og:description", content: "Genou, cheville, hanche, pied : après le diagnostic de votre professionnel, sachez qui consulter, dans quel ordre et dans quel délai." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <main>
      <HomeHero />
      <EntryGrid />
      <section className="mx-auto max-w-4xl px-4 pb-16">
        <MedicalDisclaimer />
      </section>
    </main>
  );
}

