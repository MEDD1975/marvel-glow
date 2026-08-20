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
  specialite: string;
  adresse: string;
  telephone: string;
};

type CabinetRecord = {
  nom_cabinet: string;
  praticiens: PractitionerRecord[];
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
  cabinetId: string;
  cabinetName: string;
};

export type Cabinet = {
  id: string;
  name: string;
  providers: Provider[];
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
  "Médecin généraliste": "Médecin généraliste",
  Kinésithérapeute: "Kinésithérapeute",
  Podologue: "Podologue",
  Ostéopathe: "Ostéopathe",
  Rhumatologue: "Rhumatologue",
  "Chirurgien orthopédiste": "Chirurgien orthopédiste",
  "Imagerie médicale": "Imagerie médicale",
  "Médecin du sport": "Médecin du sport",
  Urgences: "Urgences",
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
  const digits = phone.replace(/\D/g, "");
  return digits.replace(/(\d{2})(?=\d)/g, "$1 ");
}

function parseAddress(value: string) {
  const match = value.match(/^(.*?),\s*(\d{5})\s+(.+)$/);
  return {
    address: match?.[1]?.trim() ?? value,
    postalCode: match?.[2] ?? "",
    city: match?.[3]?.trim() ?? "",
  };
}

const cabinetRecords = practitionersData as Record<string, CabinetRecord>;

export const cabinets: Cabinet[] = Object.entries(cabinetRecords).map(([cabinetId, cabinet]) => ({
  id: cabinetId,
  name: cabinet.nom_cabinet,
  providers: cabinet.praticiens.flatMap((practitioner, index) => {
    const profession = specialtyToProfession[practitioner.specialite];
    if (!profession) return [];

    const location = parseAddress(practitioner.adresse);
    const phone = practitioner.telephone.replace(/\D/g, "");
    return [
      {
        id: `${cabinetId}-${slugify(practitioner.nom)}-${index}`,
        name: practitioner.nom,
        profession,
        ...location,
        phone: phone || undefined,
        formattedPhone: phone ? formatPhone(phone) : undefined,
        cabinetId,
        cabinetName: cabinet.nom_cabinet,
      },
    ];
  }),
}));

export const providers: Provider[] = cabinets.flatMap((cabinet) => cabinet.providers);

export function isProfession(value: string): value is Profession {
  return professionOrder.includes(value as Profession);
}

export function findProvidersByProfession(profession: Profession, cabinetId?: string) {
  const source = cabinetId
    ? cabinets.find((cabinet) => cabinet.id === cabinetId)?.providers ?? []
    : providers;
  return source.filter((provider) => provider.profession === profession);
}

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
