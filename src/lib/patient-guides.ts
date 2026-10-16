import { conditions } from "@/lib/conditions";
import { conditionAdvice, generalRedFlags } from "@/lib/condition-advice";
import { conditionResources, generalLinks, type ResourceLink } from "@/lib/condition-resources";

/**
 * Contenus éditoriaux du parcours patient.
 * Tant qu'un contenu n'a pas de date de validation, l'interface le signale comme
 * « en attente de validation » au lieu d'afficher une validation inexistante.
 */
export type Editorial = {
  source: string | undefined;
  validatedAt: string | undefined;
  validatedBy: string | undefined;
};

export type Recommendation = Editorial & {
  id: string;
  title: string;
  summary: string;
  intro: string;
  steps: string[];
  caution: string | undefined;
};

export type WarningSign = { id: string; label: string };

export type Exercise = Editorial & {
  id: string;
  title: string;
  phaseId: string;
  instructions: string[];
  /** Fréquence affichée uniquement lorsqu'elle a été validée. */
  frequency: string | undefined;
};

export type RehabPhase = { id: string; label: string; description: string };

export type CareStep = { id: string; title: string; description: string; status?: string };

export type PathwayGuide = {
  id: string;
  name: string;
  recommendations: Recommendation[];
  warnings: WarningSign[];
  phases: RehabPhase[];
  exercises: Exercise[];
  videos: ResourceLink[];
  sources: ResourceLink[];
  careSteps: CareStep[];
};

const pending: Editorial = { source: undefined, validatedAt: undefined, validatedBy: undefined };

const defaultCaution =
  "Ces conseils ne remplacent pas les consignes données par votre professionnel de santé.";

const entorseRecommendations: Recommendation[] = [
  {
    ...pending,
    id: "froid",
    title: "Appliquer du froid",
    summary: "Pendant 15 à 20 minutes, protégé par un linge.",
    intro: "Le froid peut aider à soulager temporairement la douleur et le gonflement.",
    steps: [
      "Protégez la peau avec un linge propre.",
      "Appliquez pendant 15 à 20 minutes.",
      "N'appliquez jamais de glace directement sur la peau.",
      "Arrêtez si la peau devient douloureuse ou insensible.",
    ],
    caution: defaultCaution,
  },
  {
    ...pending,
    id: "surelever",
    title: "Surélever la cheville",
    summary: "Au-dessus du niveau du cœur lorsque vous êtes au repos.",
    intro: "Surélever la jambe au repos peut aider à limiter le gonflement et améliorer le confort.",
    steps: [
      "Asseyez-vous ou allongez-vous confortablement.",
      "Placez un coussin sous le mollet plutôt que sous le talon.",
      "Gardez le pied au-dessus du niveau du cœur dès que possible.",
    ],
    caution: defaultCaution,
  },
  {
    ...pending,
    id: "compression",
    title: "Utiliser une compression adaptée",
    summary: "Si elle vous a été recommandée, sans serrer excessivement.",
    intro: "Une compression douce, lorsqu'elle a été recommandée, peut aider à maintenir la cheville.",
    steps: [
      "Utilisez uniquement le dispositif recommandé lors de la consultation.",
      "Le maintien doit être ferme sans être douloureux.",
      "Retirez-le si les orteils bleuissent, deviennent froids ou fourmillent.",
    ],
    caution: defaultCaution,
  },
  {
    ...pending,
    id: "appui",
    title: "Reprendre l'appui progressivement",
    summary: "Selon les consignes reçues et votre douleur.",
    intro: "La reprise progressive de la marche fait partie de la récupération, dans les limites indiquées.",
    steps: [
      "Respectez les consignes d'appui données lors de la consultation.",
      "Reprenez la marche progressivement lorsque cela est autorisé et supportable.",
      "Utilisez les aides prescrites (attelle, cannes) selon les indications reçues.",
      "Signalez toute douleur qui augmente nettement à la marche.",
    ],
    caution: defaultCaution,
  },
];

const entorseWarnings: string[] = [
  "Douleur très importante ou qui augmente rapidement",
  "Impossibilité totale de poser le pied",
  "Déformation visible",
  "Pied froid, pâle ou bleu",
  "Fourmillements ou perte de sensibilité",
  "Plaie ouverte",
  "Gonflement important et rapide",
  "Fièvre associée à une rougeur ou une chaleur importante",
];

const careSteps: CareStep[] = [
  { id: "consultation", title: "Consultation initiale", description: "Votre professionnel a évalué votre situation et vous a remis ce parcours.", status: "Réalisée" },
  { id: "recuperation", title: "Phase de récupération", description: "Suivez les recommandations et les consignes reçues." },
  { id: "suivi", title: "Suivi professionnel", description: "À adapter selon votre évolution et les recommandations reçues." },
  { id: "reprise", title: "Reprise des activités", description: "Progressive et selon les consignes de votre professionnel de santé." },
];

function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toWarnings(labels: string[]): WarningSign[] {
  const unique = Array.from(new Set(labels));
  return unique.map((label) => ({ id: slug(label), label }));
}

export function getPathwayGuide(pathwayId: string | undefined): PathwayGuide | null {
  const condition = conditions.find((item) => item.id === pathwayId);
  if (!condition) return null;
  const advice = conditionAdvice[condition.id];
  const resources = conditionResources[condition.id];
  const links = resources?.links ?? generalLinks;
  // Curated YouTube videos show rehab movements and are not doctor-selected: never shown automatically.
  const videos: ResourceLink[] = [];
  const sources = [...links.filter((link) => link.kind === "site"), ...generalLinks.filter((link) => link.kind === "site")]
    .filter((link, index, all) => all.findIndex((other) => other.url === link.url) === index);

  if (condition.id === "entorse-cheville") {
    return {
      id: condition.id,
      name: condition.name,
      recommendations: entorseRecommendations,
      warnings: toWarnings(entorseWarnings),
      phases: [],
      exercises: [],
      videos,
      sources,
      careSteps,
    };
  }

  const recommendations: Recommendation[] = (advice?.tips ?? []).slice(0, 4).map((tip) => ({
    ...pending,
    id: slug(tip.title),
    title: tip.title,
    summary: tip.content.split(/(?<=[.:])\s/)[0] ?? tip.content,
    intro: tip.content,
    steps: [],
    caution: defaultCaution,
  }));

  return {
    id: condition.id,
    name: condition.name,
    recommendations,
    warnings: toWarnings([...(advice?.redFlags ?? []), ...generalRedFlags]),
    phases: [],
    exercises: [],
    videos,
    sources,
    careSteps,
  };
}

export const patientFaq: Array<{ id: string; question: string; answer: string }> = [
  {
    id: "donnees",
    question: "Kivoir enregistre-t-il mes informations de santé ?",
    answer:
      "Non. Kivoir ne vous demande ni votre nom, ni votre adresse, ni vos symptômes. Le parcours ouvert est simplement mémorisé sur votre appareil pour que vous puissiez y revenir.",
  },
  {
    id: "remplace",
    question: "Ces conseils remplacent-ils une consultation ?",
    answer:
      "Non. Les informations présentées complètent les consignes de votre professionnel de santé. En cas de doute, contactez votre cabinet.",
  },
  {
    id: "urgence",
    question: "Que faire en cas d'urgence ?",
    answer:
      "Si vous présentez un signe inquiétant, contactez sans attendre un professionnel de santé. En cas d'urgence vitale, appelez le 15 ou le 112.",
  },
  {
    id: "revenir",
    question: "Comment retrouver mon parcours plus tard ?",
    answer:
      "Scannez à nouveau le QR code remis par votre cabinet, ou rouvrez Kivoir sur le même appareil : votre parcours est conservé.",
  },
  {
    id: "professionnels",
    question: "Qui sont les professionnels recommandés ?",
    answer:
      "Ce sont les professionnels que votre cabinet a choisi de vous communiquer. Kivoir n'effectue aucune prise de rendez-vous : contactez-les directement.",
  },
];

/** Numéros d'urgence nationaux (France). */
export const emergencyNumbers = [
  { id: "samu", label: "SAMU", number: "15" },
  { id: "europe", label: "Urgences européen", number: "112" },
];
