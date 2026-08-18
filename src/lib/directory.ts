import practitionersData from "../../data/praticiens_saint_maur.json";

/** Annuaire local — le JSON est l'unique source des fiches affichées. */
export type Profession =
  | "Médecin généraliste"
  | "Kinésithérapeute"
  | "Podologue"
  | "Ostéopathe"
  | "Rhumatologue"
  | "Chirurgien orthopédiste"
  | "Imagerie médicale"
  | "Médecin du sport"
  | "Urgences";

type PractitionerRecord = {
  nom: string;
  prenom: string;
  specialite: string;
  adresse: string;
  telephone: string;
  codePostal: string;
  ville: string;
  secteur: string;
  type: string;
  source: string;
  verifieLe: string;
};

export type Provider = {
  id: string;
  name: string;
  profession: Profession;
  address: string;
  postalCode: string;
  city: string;
  phone: string | undefined;
  formattedPhone: string | undefined;
  sector: string | undefined;
  type: string;
  source: string;
  verifiedAt: string;
};

export const professionOrder: Profession[] = [
  "Médecin généraliste",
  "Kinésithérapeute",
  "Podologue",
  "Ostéopathe",
  "Imagerie médicale",
  "Rhumatologue",
  "Chirurgien orthopédiste",
  "Médecin du sport",
  "Urgences",
];

export const professionColor: Record<Profession, string> = {
  "Médecin généraliste": "#0e7490",
  Kinésithérapeute: "#0f766e",
  Podologue: "#7c3aed",
  Ostéopathe: "#9333ea",
  "Imagerie médicale": "#2563eb",
  Rhumatologue: "#c2410c",
  "Chirurgien orthopédiste": "#b91c1c",
  "Médecin du sport": "#15803d",
  Urgences: "#dc2626",
};

const specialtyToProfession: Record<string, Profession> = {
  "Médecins généralistes": "Médecin généraliste",
  "Masseurs-kinésithérapeutes": "Kinésithérapeute",
  "Pédicures-podologues": "Podologue",
  Rhumatologues: "Rhumatologue",
  "Chirurgiens orthopédiques & Traumatologues": "Chirurgien orthopédiste",
  "Centres d'imagerie / Radiologie": "Imagerie médicale",
  "Médecins du sport": "Médecin du sport",
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatPhone(phone: string) {
  return phone.replace(/(\d{2})(?=\d)/g, "$1 ");
}

export const providers: Provider[] = (practitionersData as PractitionerRecord[]).flatMap(
  (practitioner, index) => {
    const profession = specialtyToProfession[practitioner.specialite];
    if (!profession) return [];

    const name = [practitioner.prenom, practitioner.nom].filter(Boolean).join(" ");
    return [
      {
        id: `${slugify(name)}-${index}`,
        name,
        profession,
        address: practitioner.adresse,
        postalCode: practitioner.codePostal,
        city: practitioner.ville,
        phone: practitioner.telephone || undefined,
        formattedPhone: practitioner.telephone ? formatPhone(practitioner.telephone) : undefined,
        sector: practitioner.secteur || undefined,
        type: practitioner.type,
        source: practitioner.source,
        verifiedAt: practitioner.verifieLe,
      },
    ];
  },
);

/** Étapes déclarées par le patient et professionnel à voir ensuite. */
export type JourneyStep = {
  id: string;
  label: string;
  context: string;
  example: string;
  next: Profession[];
  advice: string;
};

export const journeySteps: JourneyStep[] = [
  {
    id: "debut",
    label: "Je n'ai encore vu personne",
    context: "La douleur est apparue, aucun professionnel n'a encore examiné votre membre inférieur.",
    example: "« Je me suis tordu la cheville il y a 3 jours, ça gonfle encore. »",
    next: ["Médecin généraliste", "Urgences"],
    advice:
      "Commencez par un médecin généraliste : il examine, élimine les urgences et déclenche la suite (imagerie, kiné, spécialiste).",
  },
  {
    id: "mg-vu-diagnostic",
    label: "Le médecin a évoqué un diagnostic",
    context: "Un médecin vous a examiné et a nommé une hypothèse, sans examen complémentaire pour l'instant.",
    example: "« Le généraliste pense à une aponévrosite plantaire. »",
    next: ["Kinésithérapeute", "Podologue"],
    advice:
      "La rééducation est l'étape clé. Prenez rendez-vous en kinésithérapie sans attendre : les délais sont souvent de 1 à 3 semaines.",
  },
  {
    id: "imagerie-prescrite",
    label: "On m'a prescrit une imagerie",
    context: "Radio, échographie ou IRM a été prescrite pour confirmer ou éliminer un diagnostic.",
    example: "« J'ai une ordonnance pour une IRM du genou. »",
    next: ["Imagerie médicale"],
    advice:
      "Votre prochaine étape est de réaliser l'examen d'imagerie prescrit. Ensuite, rapportez le compte rendu au médecin prescripteur : il décidera de la suite du parcours.",
  },
  {
    id: "kine-en-cours",
    label: "Je suis déjà en rééducation",
    context: "Les séances de kinésithérapie ont commencé et vous vous demandez ce qui vient après.",
    example: "« 10 séances de kiné faites, ça va mieux mais pas totalement. »",
    next: ["Kinésithérapeute", "Médecin du sport", "Podologue"],
    advice:
      "Faites le point à mi-parcours avec votre kiné. Sans progrès à 6 semaines, retournez voir le médecin pour réévaluer.",
  },
  {
    id: "bloque",
    label: "Ça ne s'améliore pas",
    context: "Malgré les soins, la douleur persiste ou récidive au-delà du délai habituel.",
    example: "« 3 mois de douleur au talon malgré la kiné et les semelles. »",
    next: ["Rhumatologue", "Chirurgien orthopédiste", "Imagerie médicale"],
    advice:
      "C'est le moment du recours spécialisé : rhumatologue ou chirurgien selon la pathologie, avec un bilan d'imagerie à jour.",
  },
  {
    id: "reprise",
    label: "Je veux reprendre le sport",
    context: "La douleur a nettement diminué et vous souhaitez reprendre votre activité sans récidive.",
    example: "« Je voudrais recourir mais j'ai peur de me retordre la cheville. »",
    next: ["Médecin du sport", "Kinésithérapeute", "Podologue"],
    advice: "Validez la reprise avec des tests fonctionnels avant de retrouver votre niveau d'avant.",
  },
];
