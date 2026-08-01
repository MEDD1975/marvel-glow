export type Condition = {
  id: string;
  name: string;
  zone: "Cheville" | "Genou" | "Hanche" | "Pied";
  summary: string;
  typicalSigns: string;
  firstStep: string;
  whoToSee: string;
  delay: string;
};

/** Les troubles musculo-squelettiques les plus courants des membres inférieurs. */
export const conditions: Condition[] = [
  {
    id: "entorse-cheville",
    name: "Entorse de cheville",
    zone: "Cheville",
    summary: "Étirement ou déchirure des ligaments de la cheville, le plus souvent après une torsion du pied vers l'intérieur.",
    typicalSigns: "Douleur brutale après un faux pas, gonflement rapide, parfois un bleu sous la malléole.",
    firstStep: "Protection, glace, compression et surélévation pendant 48 à 72 heures, puis remise en charge progressive.",
    whoToSee: "Médecin généraliste, puis kinésithérapeute pour la rééducation et la proprioception.",
    delay: "Amélioration nette attendue en 2 à 6 semaines selon la gravité.",
  },
  {
    id: "arthrose-genou",
    name: "Arthrose du genou",
    zone: "Genou",
    summary: "Usure progressive du cartilage du genou, fréquente après 50 ans ou après un traumatisme ancien.",
    typicalSigns: "Douleur mécanique qui augmente à la marche et dans les escaliers, raideur au réveil de moins de 30 minutes.",
    firstStep: "Maintenir une activité physique adaptée (vélo, marche, natation) et éviter l'immobilité prolongée.",
    whoToSee: "Médecin généraliste ou rhumatologue, kinésithérapeute pour le renforcement du quadriceps.",
    delay: "Prise en charge au long cours ; réévaluation tous les 3 à 6 mois.",
  },
  {
    id: "aponevrosite-plantaire",
    name: "Aponévrosite plantaire",
    zone: "Pied",
    summary: "Inflammation de l'aponévrose plantaire, la lame fibreuse qui soutient la voûte du pied.",
    typicalSigns: "Douleur sous le talon, maximale aux premiers pas du matin ou après une période assise.",
    firstStep: "Étirements du mollet et de la voûte plantaire, chaussage amortissant, réduction temporaire des impacts.",
    whoToSee: "Médecin généraliste, kinésithérapeute, podologue si besoin de semelles.",
    delay: "Souvent 3 à 6 mois d'évolution ; consulter si aucune amélioration à 6 semaines.",
  },
  {
    id: "syndrome-rotulien",
    name: "Syndrome rotulien",
    zone: "Genou",
    summary: "Douleur autour ou derrière la rotule liée à un défaut de glissement rotulien, fréquente chez le sportif et l'adulte jeune.",
    typicalSigns: "Douleur en descendant les escaliers, en position assise prolongée ou après une course.",
    firstStep: "Réduire les impacts, renforcer le quadriceps et les fessiers, éviter les squats profonds douloureux.",
    whoToSee: "Kinésithérapeute en première intention, médecin si la douleur persiste.",
    delay: "Amélioration progressive sur 6 à 12 semaines de rééducation.",
  },
  {
    id: "tendinopathie-achille",
    name: "Tendinopathie d'Achille",
    zone: "Cheville",
    summary: "Souffrance du tendon d'Achille par surcharge, souvent après une reprise ou une augmentation rapide de la course.",
    typicalSigns: "Douleur et raideur au-dessus du talon le matin, qui s'échauffe puis revient après l'effort.",
    firstStep: "Adapter la charge d'entraînement et commencer un travail excentrique du mollet encadré.",
    whoToSee: "Kinésithérapeute, médecin du sport si la douleur limite la marche.",
    delay: "3 à 6 mois de rééducation progressive sont habituels.",
  },
  {
    id: "lesion-meniscale",
    name: "Lésion méniscale",
    zone: "Genou",
    summary: "Atteinte d'un ménisque, par traumatisme en rotation chez le sujet jeune ou par usure après 40 ans.",
    typicalSigns: "Douleur sur l'interligne du genou, gonflement, parfois blocage ou sensation d'accrochage.",
    firstStep: "Repos relatif, glace, éviter les rotations en charge ; ne pas forcer un genou bloqué.",
    whoToSee: "Médecin généraliste, chirurgien orthopédiste en cas de blocage vrai.",
    delay: "Avis médical sous quelques jours, urgent si le genou reste bloqué.",
  },
  {
    id: "arthrose-hanche",
    name: "Arthrose de hanche",
    zone: "Hanche",
    summary: "Usure du cartilage de l'articulation coxo-fémorale (coxarthrose).",
    typicalSigns: "Douleur au pli de l'aine irradiant vers la cuisse, gêne pour enfiler ses chaussettes, boiterie.",
    firstStep: "Activité en décharge (vélo, piscine), maintien de la mobilité, gestion du poids.",
    whoToSee: "Médecin généraliste ou rhumatologue, kinésithérapeute, chirurgien si le handicap devient majeur.",
    delay: "Suivi au long cours, réévaluation régulière.",
  },
  {
    id: "metatarsalgie",
    name: "Métatarsalgie",
    zone: "Pied",
    summary: "Douleur de l'avant-pied au niveau des têtes métatarsiennes, liée à une surcharge d'appui.",
    typicalSigns: "Sensation de marcher sur un caillou, douleur sous les orteils en fin de journée ou après la marche.",
    firstStep: "Chaussage large à semelle amortissante, réduction des talons et des longues stations debout.",
    whoToSee: "Podologue pour l'analyse d'appui, médecin généraliste si la douleur persiste.",
    delay: "Amélioration attendue en 4 à 8 semaines avec adaptation du chaussage.",
  },
  {
    id: "syndrome-essuie-glace",
    name: "Syndrome de l'essuie-glace (TFL)",
    zone: "Genou",
    summary: "Friction de la bandelette ilio-tibiale sur la face externe du genou, typique du coureur et du cycliste.",
    typicalSigns: "Douleur externe du genou apparaissant après une distance ou une durée d'effort assez constante.",
    firstStep: "Réduire le volume et les descentes, renforcer les fessiers, étirer la chaîne latérale.",
    whoToSee: "Kinésithérapeute, médecin du sport si la douleur récidive à chaque reprise.",
    delay: "4 à 8 semaines de gestion de charge et de renforcement.",
  },
  {
    id: "hallux-valgus",
    name: "Hallux valgus",
    zone: "Pied",
    summary: "Déviation progressive du gros orteil vers les autres orteils, avec saillie osseuse interne (« oignon »).",
    typicalSigns: "Bosse douloureuse au bord interne du pied, conflit avec la chaussure, rougeur cutanée.",
    firstStep: "Chaussures larges, orthèses de nuit ou de jour, soins locaux des zones de frottement.",
    whoToSee: "Podologue, puis chirurgien orthopédiste si la gêne devient permanente.",
    delay: "Évolution lente ; consulter si la douleur limite le chaussage quotidien.",
  },
];

export type TriageOption = {
  label: string;
  /** Précision concrète qui aide à choisir cette réponse. */
  detail: string;
  level: "urgent" | "professional" | "self-care";
};

export type TriageQuestion = {
  id: string;
  question: string;
  /** Pourquoi cette question est posée. */
  context: string;
  /** Exemple de réponse pour aider le patient à se situer. */
  example: string;
  options: TriageOption[];
};

export const triageQuestions: TriageQuestion[] = [
  {
    id: "appui",
    question: "Pouvez-vous vous appuyer sur la jambe et faire au moins 4 pas ?",
    context:
      "La capacité à prendre appui est le premier critère utilisé par les soignants pour distinguer une atteinte bénigne d'une lésion qui nécessite une imagerie rapide.",
    example:
      "Exemple de réponse : « Je peux marcher jusqu'à la cuisine en boitant, mais poser tout mon poids me fait très mal. » → deuxième option.",
    options: [
      {
        label: "Non, je ne peux pas poser le pied",
        detail: "Vous devez sauter à cloche-pied, vous tenir aux murs ou être aidé pour vous déplacer.",
        level: "urgent",
      },
      {
        label: "Oui, mais en boitant et avec une douleur forte",
        detail: "Vous marchez quelques pas, mais l'appui complet est très douloureux.",
        level: "professional",
      },
      {
        label: "Oui, la marche est possible avec une gêne modérée",
        detail: "Vous marchez presque normalement, la douleur apparaît surtout à l'effort.",
        level: "self-care",
      },
    ],
  },
  {
    id: "duree",
    question: "Depuis combien de temps la douleur est-elle présente ?",
    context:
      "La durée oriente la prise en charge : une douleur récente relève des premiers soins, une douleur installée depuis plusieurs semaines demande un bilan et une rééducation encadrée.",
    example:
      "Exemple de réponse : « J'ai commencé à avoir mal au talon il y a environ deux mois, un peu plus chaque semaine. » → troisième option.",
    options: [
      {
        label: "Moins de 48 heures",
        detail: "Traumatisme récent ou douleur apparue brutalement ces deux derniers jours.",
        level: "self-care",
      },
      {
        label: "Entre 2 jours et 6 semaines",
        detail: "La douleur dure depuis plusieurs jours ou semaines sans vraiment disparaître.",
        level: "professional",
      },
      {
        label: "Plus de 6 semaines",
        detail: "Douleur chronique ou récidivante, parfois installée depuis des mois.",
        level: "professional",
      },
    ],
  },
  {
    id: "alerte",
    question: "Présentez-vous un ou plusieurs signes d'alerte ?",
    context:
      "Certains signes évoquent une fracture, une infection ou un problème vasculaire. Ils changent immédiatement le niveau d'urgence, quelle que soit la pathologie suspectée.",
    example:
      "Exemple de réponse : « Ma cheville est très gonflée mais je n'ai ni fièvre, ni fourmillements, ni déformation. » → dernière option.",
    options: [
      {
        label: "Oui, déformation visible ou membre froid/insensible",
        detail: "Angle anormal du membre, pâleur, fourmillements persistants ou perte de sensibilité.",
        level: "urgent",
      },
      {
        label: "Oui, fièvre, rougeur chaude ou douleur nocturne intense",
        detail: "Articulation chaude et rouge, fièvre associée, ou douleur qui réveille la nuit.",
        level: "urgent",
      },
      {
        label: "Non, aucun de ces signes",
        detail: "La douleur est mécanique : elle augmente à l'effort et diminue au repos.",
        level: "self-care",
      },
    ],
  },
];

export type TriageLevel = "urgent" | "professional" | "self-care";

export const levelCopy: Record<TriageLevel, { title: string; message: string; actions: string[] }> = {
  urgent: {
    title: "Consultation rapide recommandée",
    message:
      "Vos réponses évoquent une situation qui doit être évaluée sans attendre par un professionnel de santé, avec possiblement une imagerie.",
    actions: [
      "Contactez votre médecin le jour même, ou les urgences si la douleur est majeure",
      "Évitez l'appui sur le membre en attendant l'avis",
      "Glace et surélévation pour limiter le gonflement",
    ],
  },
  professional: {
    title: "Un avis professionnel est indiqué",
    message:
      "La situation n'est pas urgente, mais elle demande un examen pour poser un diagnostic précis et engager la bonne rééducation.",
    actions: [
      "Prenez rendez-vous chez votre médecin généraliste dans les prochains jours",
      "Notez ce qui déclenche et ce qui soulage la douleur pour la consultation",
      "Adaptez l'activité sans arrêter complètement de bouger",
    ],
  },
  "self-care": {
    title: "Auto-soin surveillé possible",
    message:
      "Vos réponses n'évoquent pas de signe de gravité. Vous pouvez commencer par les premiers soins en surveillant l'évolution.",
    actions: [
      "Appliquez les premiers soins adaptés à votre trouble",
      "Reprenez l'activité progressivement, dans la limite de la douleur",
      "Consultez si aucune amélioration après 7 à 10 jours",
    ],
  },
};
