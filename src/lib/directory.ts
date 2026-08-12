/**
 * Annuaire local — Saint-Maur-des-Fossés (94).
 * Données de démonstration : structures et coordonnées à valider avant mise en production.
 * Aucune donnée patient n'est stockée ici.
 */

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

export type Provider = {
  id: string;
  name: string;
  profession: Profession;
  address: string;
  district: string;
  lat: number;
  lng: number;
  phone?: string;
  note?: string;
  /** Accès direct sans passer par une prescription. */
  directAccess: boolean;
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

export const cityCenter = { lat: 48.7994, lng: 2.4934 };

export const providers: Provider[] = [
  {
    id: "mg-parc",
    name: "Cabinet médical du Parc",
    profession: "Médecin généraliste",
    address: "Avenue du Bac, quartier du Parc",
    district: "Le Parc",
    lat: 48.8065,
    lng: 2.4885,
    directAccess: true,
    note: "Premier recours : examen clinique, arrêt de travail, prescription d'imagerie ou de kiné.",
  },
  {
    id: "mg-varenne",
    name: "Maison de santé de La Varenne",
    profession: "Médecin généraliste",
    address: "Avenue du Bac, La Varenne-Saint-Hilaire",
    district: "La Varenne",
    lat: 48.7935,
    lng: 2.5145,
    directAccess: true,
    note: "Consultations non programmées possibles en journée.",
  },
  {
    id: "mg-adamville",
    name: "Cabinet de groupe Adamville",
    profession: "Médecin généraliste",
    address: "Rue Garibaldi, Adamville",
    district: "Adamville",
    lat: 48.7912,
    lng: 2.4835,
    directAccess: true,
  },
  {
    id: "kine-centre",
    name: "Cabinet de kinésithérapie du Centre",
    profession: "Kinésithérapeute",
    address: "Avenue de la République, centre-ville",
    district: "Centre-ville",
    lat: 48.7996,
    lng: 2.4941,
    directAccess: false,
    note: "Rééducation cheville, genou et pied. Ordonnance médicale recommandée.",
  },
  {
    id: "kine-varenne",
    name: "Kinésithérapie du sport — La Varenne",
    profession: "Kinésithérapeute",
    address: "Avenue Joffre, La Varenne-Saint-Hilaire",
    district: "La Varenne",
    lat: 48.7908,
    lng: 2.5182,
    directAccess: false,
    note: "Renforcement, proprioception et reprise du sport.",
  },
  {
    id: "kine-champignol",
    name: "Cabinet kiné Champignol",
    profession: "Kinésithérapeute",
    address: "Boulevard de Champigny, Champignol",
    district: "Champignol",
    lat: 48.7871,
    lng: 2.4975,
    directAccess: false,
  },
  {
    id: "podo-centre",
    name: "Pédicure-podologue du centre",
    profession: "Podologue",
    address: "Rue du Pont de Créteil",
    district: "Centre-ville",
    lat: 48.7952,
    lng: 2.4862,
    directAccess: true,
    note: "Bilan postural, semelles orthopédiques sur mesure.",
  },
  {
    id: "podo-varenne",
    name: "Podologie La Varenne",
    profession: "Podologue",
    address: "Avenue du Bac, La Varenne",
    district: "La Varenne",
    lat: 48.7926,
    lng: 2.5121,
    directAccess: true,
  },
  {
    id: "osteo-centre",
    name: "Ostéopathie Saint-Maur Centre",
    profession: "Ostéopathe",
    address: "Avenue Foch",
    district: "Centre-ville",
    lat: 48.8017,
    lng: 2.4903,
    directAccess: true,
    note: "En complément, jamais en remplacement d'un avis médical en cas de traumatisme.",
  },
  {
    id: "imagerie-centre",
    name: "Centre d'imagerie médicale Saint-Maur",
    profession: "Imagerie médicale",
    address: "Avenue de la République",
    district: "Centre-ville",
    lat: 48.7988,
    lng: 2.4922,
    directAccess: false,
    note: "Radiographie, échographie. IRM sur rendez-vous, ordonnance obligatoire.",
  },
  {
    id: "imagerie-creteil",
    name: "Plateau d'imagerie (IRM/scanner) — secteur Créteil",
    profession: "Imagerie médicale",
    address: "Proche Saint-Maur–Créteil (RER A)",
    district: "Limite Créteil",
    lat: 48.7902,
    lng: 2.4762,
    directAccess: false,
    note: "Créneaux IRM plus rapides qu'en centre-ville en général.",
  },
  {
    id: "rhumato-centre",
    name: "Consultation de rhumatologie",
    profession: "Rhumatologue",
    address: "Avenue de la République",
    district: "Centre-ville",
    lat: 48.8003,
    lng: 2.4958,
    directAccess: false,
    note: "Arthrose, tendinopathies rebelles, infiltrations.",
  },
  {
    id: "ortho-varenne",
    name: "Chirurgie orthopédique — consultation avancée",
    profession: "Chirurgien orthopédiste",
    address: "Avenue Joffre, La Varenne",
    district: "La Varenne",
    lat: 48.7918,
    lng: 2.5163,
    directAccess: false,
    note: "Lésion méniscale, instabilité, hallux valgus, prothèse.",
  },
  {
    id: "sport-parc",
    name: "Médecine du sport — Le Parc",
    profession: "Médecin du sport",
    address: "Quartier du Parc",
    district: "Le Parc",
    lat: 48.8051,
    lng: 2.4922,
    directAccess: true,
    note: "Validation de la reprise sportive, réathlétisation.",
  },
  {
    id: "urgences-creteil",
    name: "Service d'urgences le plus proche",
    profession: "Urgences",
    address: "CHI Créteil / CHIC secteur 94",
    district: "Créteil",
    lat: 48.7826,
    lng: 2.4581,
    phone: "15",
    directAccess: true,
    note: "Déformation, impossibilité d'appui, fièvre, signes neurologiques : appeler le 15.",
  },
];

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

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}
