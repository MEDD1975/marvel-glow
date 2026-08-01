import { createFileRoute } from "@tanstack/react-router";
import { HomeHero, EntryGrid, MedicalDisclaimer } from "@/components/HomeBlocks";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ChevilleClaire — Entorse de cheville, parcours de soin" },
      { name: "description", content: "Guide simple et rassurant pour comprendre la suite d'une entorse de cheville : qui consulter, à quel moment et comment suivre la récupération." },
      { property: "og:title", content: "ChevilleClaire — Entorse de cheville, parcours de soin" },
      { property: "og:description", content: "Guide simple et rassurant pour comprendre la suite d'une entorse de cheville : qui consulter, à quel moment et comment suivre la récupération." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HomeHero />
        <EntryGrid />
        <section className="mx-auto max-w-4xl px-4 pb-16">
          <MedicalDisclaimer />
        </section>
      </main>
    </div>
  );
}
