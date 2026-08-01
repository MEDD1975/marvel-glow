export type OrientationNode = {
  id: string;
  question: string;
  options: {
    label: string;
    nextId?: string;
    result?: {
      level: "urgent" | "professional" | "self-care" | "monitor";
      title: string;
      message: string;
      actions: string[];
      whoToSee?: string;
      when?: string;
    };
  }[];
};

export const orientationTree: OrientationNode[] = [
  {
    id: "start",
    question: "Où en êtes-vous aujourd'hui ?",
    options: [
      {
        label: "Je viens de me faire mal et je ne sais pas quoi faire",
        nextId: "acute",
      },
      {
        label: "Un diagnostic d'entorse de cheville a déjà été posé",
        result: {
          level: "professional",
          title: "Suivez le parcours de soins",
          message:
            "Avec un diagnostic posé, le mieux est de suivre la chronologie recommandée : phase aiguë, puis rééducation, puis retour progressif à l'activité.",
          actions: ["Consultez la page Parcours de soins", "Prenez rendez-vous avec un kinésithérapeute si ce n'est pas déjà fait"],
          whoToSee: "Médecin généraliste ou spécialiste ayant posé le diagnostic",
          when: "Suivez les rendez-vous prévus et la page Parcours de soins",
        },
      },
    ],
  },
  {
    id: "acute",
    question: "Pouvez-vous poser le pied au sol et marcher au moins 4 pas ?",
    options: [
      {
        label: "Non, je ne peux pas poser le pied ou marcher",
        result: {
          level: "urgent",
          title: "Consultation urgente recommandée",
          message:
            "L'impossibilité de poser le pied peut traduire une entorse grave ou une fracture. Il est prudent de consulter rapidement les urgences ou un médecin urgentiste.",
          actions: ["Allez aux urgences ou appelez le 15 si la douleur est très intense", "Immobilisez la cheville, surélez-la et appliquez de la glace"],
          whoToSee: "Urgences ou médecin urgentiste",
          when: "Dans les plus brefs délais",
        },
      },
      {
        label: "Oui, mais avec une douleur importante",
        nextId: "deformity",
      },
      {
        label: "Oui, la douleur est modérée ou légère",
        nextId: "swelling",
      },
    ],
  },
  {
    id: "deformity",
    question: "Observez-vous un gonflement important, une déformité visible ou une sensation d'instabilité ?",
    options: [
      {
        label: "Oui",
        result: {
          level: "urgent",
          title: "Consultez rapidement un professionnel de santé",
          message:
            "Un gonflement majeur, une déformité ou une sensation d'instabilité peuvent indiquer une lésion plus grave. Une radiographie ou un examen spécialisé peut être nécessaire.",
          actions: ["Rendez-vous aux urgences ou chez un médecin généraliste dans la journée", "Surélevez la jambe et appliquez de la glace en attendant"],
          whoToSee: "Médecin généraliste, urgentiste ou chirurgien orthopédiste",
          when: "Le jour même ou le lendemain",
        },
      },
      {
        label: "Non",
        result: {
          level: "professional",
          title: "Consultez un médecin généraliste",
          message:
            "Même sans déformité, une douleur importante au premier jour mérite un avis médical pour évaluer la gravité et adapter les soins.",
          actions: ["Prenez rendez-vous chez un médecin généraliste", "Appliquez le protocole de glace/repos/surélévation en attendant"],
          whoToSee: "Médecin généraliste",
          when: "Dans les 24-48 heures",
        },
      },
    ],
  },
  {
    id: "swelling",
    question: "La cheville est-elle gonflée ou avez-vous une sensation d'instabilité ?",
    options: [
      {
        label: "Oui, gonflée et/ou instable",
        result: {
          level: "professional",
          title: "Un avis médical est recommandé",
          message:
            "Un gonflement ou une instabilité peut signifier une entorse plus importante. Un médecin pourra évaluer si une imagerie ou une immobilisation est nécessaire.",
          actions: ["Consultez un médecin généraliste", "Commencez le protocole de glace/repos/surélévation"],
          whoToSee: "Médecin généraliste",
          when: "Dans les 24-48 heures",
        },
      },
      {
        label: "Non, douleur légère sans gonflement",
        result: {
          level: "self-care",
          title: "Vous pouvez commencer par un auto-soin surveillé",
          message:
            "Une douleur légère sans gonflement ni instabilité peut souvent être prise en charge à domicile les premiers jours, à condition de bien surveiller l'évolution.",
          actions: ["Appliquez le protocole GRS (glace, repos, surélévation) 48-72h", "Consultez si la douleur ne s'améliore pas en 3-5 jours"],
          whoToSee: "Pharmacien ou médecin généraliste si persistance",
          when: "Si pas d'amélioration en 3 à 5 jours",
        },
      },
    ],
  },
];

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
