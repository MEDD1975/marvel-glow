import { createFileRoute } from "@tanstack/react-router";
import { AssistantHome, MedicalDisclaimer } from "@/components/HomeBlocks";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Assistant Kivoir — Votre suivi après la consultation" },
      { name: "description", content: "À la maison après votre consultation, l’Assistant Kivoir vous aide à évaluer votre récupération, comprendre vos consignes et trouver le bon professionnel." },
      { property: "og:title", content: "Assistant Kivoir — Votre suivi après la consultation" },
      { property: "og:description", content: "Évaluez votre récupération, posez vos questions et accédez au réseau de soins de votre médecin avec l’Assistant Kivoir." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <main>
      <AssistantHome />
      <section className="mx-auto max-w-4xl px-4 pb-16">
        <MedicalDisclaimer />
      </section>
    </main>
  );
}

