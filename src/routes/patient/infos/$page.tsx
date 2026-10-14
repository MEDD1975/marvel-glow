import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState, PageHeading } from "@/components/patient/PatientUi";

const pages: Record<string, { title: string; paragraphs: string[] }> = {
  "a-propos": {
    title: "À propos de Kivoir",
    paragraphs: [
      "Kivoir aide les professionnels de santé à transmettre à leurs patients des conseils, des ressources et les coordonnées de professionnels qu'ils recommandent.",
      "L'espace patient est ouvert grâce au QR code remis lors de la consultation. Il ne nécessite aucun compte.",
    ],
  },
  conditions: {
    title: "Conditions d'utilisation",
    paragraphs: [
      "Les informations présentées ont une vocation informative et ne remplacent pas un avis médical.",
      "Kivoir n'effectue ni diagnostic, ni prise de rendez-vous, ni suivi médical.",
    ],
  },
  confidentialite: {
    title: "Confidentialité",
    paragraphs: [
      "L'espace patient ne vous demande ni votre nom, ni vos coordonnées, ni vos symptômes.",
      "Le parcours ouvert est mémorisé sur votre appareil. Chaque scan de QR code est comptabilisé (cabinet et parcours concernés, sans information sur le patient).",
    ],
  },
  accessibilite: {
    title: "Accessibilité",
    paragraphs: [
      "L'espace patient a été pensé pour être lisible sur mobile et utilisable au clavier. Aucun audit d'accessibilité officiel n'a encore été réalisé.",
      "Vous pouvez agrandir le texte depuis les réglages de votre téléphone ou de votre navigateur.",
    ],
  },
};

export const Route = createFileRoute("/patient/infos/$page")({
  component: InfoPage,
});

function InfoPage() {
  const { page } = Route.useParams();
  const content = pages[page];
  if (!content) return <EmptyState title="Page introuvable" action={<Link className="font-semibold text-care" to="/patient">Retour à l&apos;accueil</Link>} />;
  return (
    <article>
      <PageHeading back={{ to: "/patient", label: "Accueil" }} title={content.title} />
      <div className="flex flex-col gap-4 text-base leading-relaxed text-foreground">
        {content.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
