
export const pathwayStages = [
  {
    id: "acute",
    title: "Phase aiguë",
    days: "J 0 à J 3-7",
    goal: "Soulager la douleur, limiter le gonflement, protéger la cheville.",
    do: [
      "Glace 15-20 min, 3 à 5 fois par jour (protection de la peau)",
      "Repos relatif : éviter l'appui si la douleur est importante",
      "Surélévation au-dessus du niveau du cœur pour réduire l'œdème",
      "Orthèse ou bandage compressif si prescrit",
    ],
    see: "Médecin généraliste, urgentiste si douleur majeure ou impossibilité de marcher.",
    avoid: [
      "Chaleur, massage profond ou consommation d'alcool dans les premières 48h",
      "Appui forcé qui augmente la douleur",
    ],
  },
  {
    id: "subacute",
    title: "Phase sous-aiguë",
    days: "J 3 à J 14",
    goal: "Récupérer la mobilité, réduire le gonflement, reprendre un appui progressif.",
    do: [
      "Mouvements doux de cheville dans la limite de la douleur",
      "Appui progressif selon les consignes médicales",
      "Consultation en kinésithérapie pour un programme adapté",
    ],
    see: "Kinésithérapeute pour la rééducation et le médecin si l'évolution stagne.",
    avoid: [
      "Sédentarité totale au-delà de quelques jours",
      "Mouvements brutaux ou retour au sport prématuré",
    ],
  },
  {
    id: "rehab",
    title: "Rééducation",
    days: "Semaine 2 à 6",
    goal: "Renforcer la cheville, retrouver l'équilibre et la proprioception.",
    do: [
      "Exercices de renforcement musculaire (mollets, cheville, hanche)",
      "Exercices d'équilibre et de proprioception",
      "Travail du gainage et de la marche",
      "Suivi régulier en kinésithérapie",
    ],
    see: "Kinésithérapeute. Revoir le médecin si rechutes ou gonflement persistant.",
    avoid: [
      "Sauter les étapes de renforcement",
      "Reprendre le sport sans validation d'un professionnel",
    ],
  },
  {
    id: "return",
    title: "Retour à l'activité",
    days: "Semaine 6 à 12+",
    goal: "Reprendre progressivement le sport et les activités quotidiennes sans douleur.",
    do: [
      "Retour progressif au sport : intensité, durée, impacts",
      "Port d'une chevillère de maintien si recommandé",
      "Échauffement et renforcement de prévention",
    ],
    see: "Médecin du sport ou kinésithérapeute pour valider le retour au sport.",
    avoid: [
      "Reprise brutale du niveau d'avant la blessure",
      "Ignorer une douleur résiduelle qui réapparaît",
    ],
  },
];

export const redFlags = [
  "Impossibilité de poser le pied au sol ou de marcher 4 pas",
  "Déformité visible de la cheville ou du pied",
  "Gonflement important et rapide",
  "Engourdissement, fourmillement ou pâleur du pied",
  "Douleur intense au repos ou la nuit",
  "Fièvre associée à une rougeur de la cheville",
  "Chute ou traumatisme avec un bruit audible",
  "Cheville chaude, rouge et très tendue",
];

export const dailyTips = [
  {
    title: "Glace",
    content: "Appliquez une poche de glace enveloppée 15 à 20 minutes, plusieurs fois par jour. Protégez toujours la peau pour éviter les brûlures.",
  },
  {
    title: "Surélévation",
    content: "Quand vous êtes assis ou allongé, surélevez la cheville au-dessus du niveau du cœur pour réduire le gonflement.",
  },
  {
    title: "Repos relatif",
    content: "Ne restez pas immobile trop longtemps. Faites de petits mouvements doux pour éviter la raideur, tout en respectant la douleur.",
  },
  {
    title: "Compression",
    content: "Un bandage élastique ou une chevillère peut limiter l'œdème. Attention : ne pas trop serrer pour ne pas bloquer la circulation.",
  },
  {
    title: "Sommeil",
    content: "Dormez avec un coussin sous le mollet pour maintenir la cheville surélevée. Cela aide à réduire le gonflement au réveil.",
  },
  {
    title: "Chaussures",
    content: "Portez des chaussures fermées, plates et stables. Évitez les talons et les semelles molles en phase de récupération.",
  },
];

export const professionals = [
  {
    role: "Médecin généraliste",
    when: "Premier contact, diagnostic initial, orientation vers un spécialiste si besoin.",
  },
  {
    role: "Urgences / SAMU (15)",
    when: "Douleur intense, impossibilité de marcher, déformité, signes neurologiques ou vasculaires.",
  },
  {
    role: "Chirurgien orthopédiste",
    when: "Entorse grave, suspicion de fracture, instabilité, ou récupération anormale.",
  },
  {
    role: "Kinésithérapeute",
    when: "Dès la phase sous-aiguë pour la rééducation, le renforcement et la proprioception.",
  },
  {
    role: "Podologue / orthopédiste",
    when: "Si un problème de posture ou de semelle contribue à la récidive ou à la fragilité de la cheville.",
  },
];
