export type Zone = "Cheville" | "Genou" | "Hanche" | "Pied";

/** Repère (x, y) représentatif de chaque zone sur le schéma du membre inférieur (viewBox 120x300). */
export const zoneSpots: Record<Zone, { x: number; y: number }> = {
  Hanche: { x: 82, y: 38 },
  Genou: { x: 60, y: 152 },
  Cheville: { x: 60, y: 238 },
  Pied: { x: 92, y: 266 },
};

/** Description concrète de chaque zone, en langage patient. */
export const zoneDescriptions: Record<Zone, string> = {
  Hanche: "Aine, fesse ou haut de la cuisse",
  Genou: "Rotule, interligne, face interne ou externe du genou",
  Cheville: "Malléoles, tendon d'Achille ou talon",
  Pied: "Plante, avant-pied, orteils ou bord interne du pied",
};

export type Condition = {
  id: string;
  name: string;
  zone: Zone;
  summary: string;
  /** Où exactement se situe la douleur, en langage concret. */
  location: string;
  /** Image mentale de la sensation ressentie. */
  feels: string;
  /** Gestes ou moments qui déclenchent typiquement la douleur. */
  triggers: string;
  /** Repère (x, y) sur le schéma du membre inférieur (viewBox 120x300). */
  spot: { x: number; y: number };
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
    location: "Sur le côté externe de la cheville, juste sous la bosse osseuse (malléole), à un ou deux travers de doigt en avant d'elle.",
    feels: "Comme une brûlure profonde au moment du faux pas, puis une cheville « en boule » qui semble trop grosse pour la chaussure.",
    triggers: "Se tourner brusquement, poser le pied sur un trottoir ou un caillou, marcher sur un terrain irrégulier.",
    spot: { x: 74, y: 238 },
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
    location: "À l'intérieur du genou et tout autour de la rotule, parfois décrite avec la main posée à plat sur l'articulation.",
    feels: "Comme une articulation rouillée qu'il faut « dérouiller » quelques minutes avant qu'elle glisse à nouveau.",
    triggers: "Descendre un escalier, se relever d'une chaise basse, marcher longtemps, le froid et l'humidité.",
    spot: { x: 52, y: 152 },
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
    location: "Sous le talon, à l'endroit précis où le talon touche le sol, un peu vers l'intérieur du pied.",
    feels: "Comme marcher sur un clou ou un galet pointu aux tout premiers pas du matin, puis ça s'estompe.",
    triggers: "Les premiers pas au réveil, le redémarrage après être resté assis, la marche pieds nus sur du carrelage.",
    spot: { x: 62, y: 272 },
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
    location: "En avant du genou, autour et derrière la rotule ; on désigne souvent la douleur en encerclant la rotule avec les doigts.",
    feels: "Comme un frottement ou un grincement derrière la rotule, avec un genou qui « lâche » parfois.",
    triggers: "Descendre les escaliers, rester assis longtemps jambes pliées (voiture, cinéma), s'accroupir, courir en descente.",
    spot: { x: 60, y: 148 },
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
    location: "Derrière la cheville, sur le cordon du tendon d'Achille, 2 à 6 cm au-dessus du talon ; on peut le pincer entre deux doigts.",
    feels: "Comme une corde raide et épaissie, chaude le matin, qui se dérouille à l'échauffement puis fait mal après l'effort.",
    triggers: "Les premiers pas du matin, la reprise de la course, les côtes, le port de chaussures plates.",
    spot: { x: 44, y: 240 },
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
    location: "Sur la ligne horizontale du genou (l'interligne), le plus souvent côté intérieur ; on montre la douleur avec un seul doigt.",
    feels: "Comme un caillou coincé dans l'articulation, avec des accrochages ou un genou qui reste bloqué en flexion.",
    triggers: "Un mouvement de rotation genou fléchi, s'accroupir, pivoter sur la jambe d'appui.",
    spot: { x: 42, y: 158 },
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
    location: "Au pli de l'aine, en avant de la hanche, avec une irradiation vers l'avant de la cuisse et parfois jusqu'au genou.",
    feels: "Comme un blocage profond à l'aine qui raccourcit le pas et rend le membre difficile à écarter.",
    triggers: "Enfiler chaussettes et chaussures, monter en voiture, marcher longtemps, se relever après une longue station assise.",
    spot: { x: 38, y: 44 },
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
    location: "Sous l'avant-pied, à la base des orteils, sur le coussinet d'appui des têtes métatarsiennes.",
    feels: "Comme marcher sur un caillou ou sur une couture de chaussette pliée, avec parfois une peau épaissie (durillon).",
    triggers: "La marche prolongée, les chaussures à talons ou trop étroites, la fin de journée debout, la course.",
    spot: { x: 94, y: 266 },
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
    location: "Sur la face externe du genou, sur la bosse osseuse latérale, à environ trois travers de doigt au-dessus de l'interligne.",
    feels: "Comme une lame chauffante qui frotte sur le côté du genou, apparaissant toujours après la même distance.",
    triggers: "Courir, surtout en descente ou sur route inclinée ; pédaler longtemps ; descendre un escalier.",
    spot: { x: 78, y: 146 },
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
    location: "Au bord interne du pied, sur la saillie osseuse à la base du gros orteil (« l'oignon »).",
    feels: "Comme une bosse qui frotte et chauffe contre la chaussure, avec un gros orteil qui part vers les autres.",
    triggers: "Les chaussures étroites ou pointues, la marche prolongée, la station debout.",
    spot: { x: 84, y: 262 },
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

/** Questions posées à tout le monde, en tête de questionnaire. */
export const commonLeadQuestions: TriageQuestion[] = [
  {
    id: "intensite",
    question: "À combien estimez-vous votre douleur en ce moment ?",
    context:
      "L'intensité ressentie aide le médecin à mesurer le retentissement de la douleur et à suivre son évolution dans le temps.",
    example:
      "Exemple de réponse : « En marchant c'est facilement 6 ou 7 sur 10, au repos ça redescend à 3. » → deuxième option.",
    options: [
      {
        label: "Légère (1 à 3 sur 10)",
        detail: "Gênante mais supportable, elle ne vous empêche pas vos activités.",
        level: "self-care",
      },
      {
        label: "Modérée (4 à 6 sur 10)",
        detail: "Elle vous gêne dans certaines activités et vous y pensez souvent.",
        level: "professional",
      },
      {
        label: "Forte (7 à 10 sur 10)",
        detail: "Elle limite fortement vos mouvements ou vous réveille la nuit.",
        level: "professional",
      },
    ],
  },
  {
    id: "duree",
    question: "Depuis combien de temps la douleur est-elle présente ?",
    context:
      "La durée oriente la prise en charge : une douleur récente relève des premiers soins, une douleur installée depuis plusieurs semaines demande un bilan et une rééducation encadrée.",
    example:
      "Exemple de réponse : « J'ai commencé à avoir mal il y a environ deux mois, un peu plus chaque semaine. » → troisième option.",
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
];

/** Signes d'alerte, posés à tout le monde en fin de questionnaire. */
export const alertQuestion: TriageQuestion = {
  id: "alerte",
  question: "Présentez-vous un ou plusieurs signes d'alerte ?",
  context:
    "Certains signes évoquent une fracture, une infection ou un problème vasculaire. Ils sont importants à signaler au médecin, quelle que soit la zone concernée.",
  example:
    "Exemple de réponse : « C'est gonflé mais je n'ai ni fièvre, ni fourmillements, ni déformation. » → dernière option.",
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
};

/** Questions spécifiques à chaque zone, posées entre le tronc commun et les signes d'alerte. */
export const zoneQuestions: Record<Zone, TriageQuestion[]> = {
  Cheville: [
    {
      id: "cheville-gonflement",
      question: "Votre cheville a-t-elle gonflé ou présenté un bleu ?",
      context:
        "Un gonflement rapide et une ecchymose orientent vers une atteinte des ligaments ou de l'os lors d'un traumatisme.",
      example:
        "Exemple de réponse : « Elle a doublé de volume dans l'heure et un bleu est apparu sous la cheville. » → première option.",
      options: [
        { label: "Oui, gonflement rapide et/ou bleu", detail: "L'œdème est apparu vite, parfois avec un hématome visible.", level: "professional" },
        { label: "Un léger gonflement seulement", detail: "La cheville est un peu enflée, sans bleu marqué.", level: "self-care" },
        { label: "Non, ni gonflement ni bleu", detail: "L'aspect de la cheville n'a pas vraiment changé.", level: "self-care" },
      ],
    },
    {
      id: "cheville-appui",
      question: "Pouvez-vous prendre appui, et la cheville vous semble-t-elle instable ?",
      context:
        "La capacité d'appui et un sentiment d'instabilité aident à distinguer une simple entorse d'une atteinte plus sérieuse.",
      example:
        "Exemple de réponse : « Je marche en boitant mais j'ai l'impression que la cheville part sur le côté. » → deuxième option.",
      options: [
        { label: "Non, l'appui est impossible", detail: "Vous ne pouvez pas poser le pied ni faire quelques pas.", level: "urgent" },
        { label: "Appui possible mais cheville instable", detail: "Vous marchez en boitant, avec une sensation d'instabilité.", level: "professional" },
        { label: "Appui stable et sans dérobement", detail: "Vous prenez appui normalement, la cheville tient bien.", level: "self-care" },
      ],
    },
  ],
  Genou: [
    {
      id: "genou-blocage",
      question: "Votre genou se bloque-t-il ou se dérobe-t-il ?",
      context:
        "Un blocage vrai ou des dérobements orientent vers une atteinte du ménisque ou de l'appareil ligamentaire.",
      example:
        "Exemple de réponse : « Il m'est arrivé deux fois de sentir le genou lâcher en descendant l'escalier. » → deuxième option.",
      options: [
        { label: "Oui, il reste bloqué par moments", detail: "Le genou se coince en flexion et se débloque difficilement.", level: "professional" },
        { label: "Il se dérobe ou lâche parfois", detail: "Vous ressentez une instabilité, surtout en appui.", level: "professional" },
        { label: "Non, ni blocage ni dérobement", detail: "Le genou reste stable, sans accrochage.", level: "self-care" },
      ],
    },
    {
      id: "genou-escaliers",
      question: "Le genou gonfle-t-il, et la douleur augmente-t-elle dans les escaliers ?",
      context:
        "Le gonflement et une douleur majorée dans les escaliers sont des repères classiques des douleurs de genou.",
      example:
        "Exemple de réponse : « Il enfle après le sport et descendre les marches est le plus douloureux. » → première option.",
      options: [
        { label: "Oui, il gonfle et les escaliers font mal", detail: "Épanchement visible et douleur nette en descente.", level: "professional" },
        { label: "Douleur aux escaliers, sans gonflement", detail: "Gêne mécanique surtout en descente, sans épanchement.", level: "self-care" },
        { label: "Ni gonflement ni gêne aux escaliers", detail: "La douleur apparaît dans d'autres circonstances.", level: "self-care" },
      ],
    },
  ],
  Hanche: [
    {
      id: "hanche-gestes",
      question: "Certains gestes du quotidien sont-ils devenus difficiles ?",
      context:
        "La difficulté à enfiler ses chaussettes ou à monter en voiture traduit une perte de mobilité de la hanche.",
      example:
        "Exemple de réponse : « Mettre mes chaussettes le matin est devenu compliqué du côté douloureux. » → première option.",
      options: [
        { label: "Oui, chaussettes/voiture difficiles", detail: "Les mouvements de rotation et de flexion sont limités.", level: "professional" },
        { label: "Un peu gêné, mais je m'adapte", detail: "Certains gestes demandent des précautions.", level: "self-care" },
        { label: "Non, mes gestes sont normaux", detail: "Aucune limitation dans les mouvements courants.", level: "self-care" },
      ],
    },
    {
      id: "hanche-irradiation",
      question: "La douleur descend-elle dans la cuisse, et boitez-vous ?",
      context:
        "Une douleur qui irradie vers la cuisse et une boiterie aident à situer l'origine et le retentissement de la gêne.",
      example:
        "Exemple de réponse : « Ça part de l'aine et descend devant la cuisse, et je boite en fin de journée. » → première option.",
      options: [
        { label: "Oui, irradiation et boiterie", detail: "La douleur descend dans la cuisse et modifie votre marche.", level: "professional" },
        { label: "Irradiation ou boiterie", detail: "Un seul des deux signes est présent.", level: "professional" },
        { label: "Ni irradiation ni boiterie", detail: "La douleur reste localisée et la marche est normale.", level: "self-care" },
      ],
    },
  ],
  Pied: [
    {
      id: "pied-moment",
      question: "À quel moment la douleur du pied est-elle la plus forte ?",
      context:
        "Le moment de la douleur oriente : premiers pas du matin, appui prolongé ou conflit avec la chaussure.",
      example:
        "Exemple de réponse : « Les premiers pas au réveil sont terribles, puis ça se calme. » → première option.",
      options: [
        { label: "Aux premiers pas du matin", detail: "Douleur maximale au lever ou après être resté assis.", level: "self-care" },
        { label: "En fin de journée / après la marche", detail: "La douleur s'installe avec l'appui prolongé.", level: "self-care" },
        { label: "Au chaussage / au frottement", detail: "La douleur apparaît au contact de la chaussure.", level: "self-care" },
      ],
    },
    {
      id: "pied-chaussage",
      question: "Le chaussage aggrave-t-il votre douleur ?",
      context:
        "Le rôle de la chaussure aide à distinguer un conflit mécanique d'une surcharge d'appui de l'avant-pied.",
      example:
        "Exemple de réponse : « Dans des chaussures étroites c'est bien pire, pieds nus ça va mieux. » → première option.",
      options: [
        { label: "Oui, nettement", detail: "Certaines chaussures rendent la douleur beaucoup plus vive.", level: "self-care" },
        { label: "Un peu", detail: "Le chaussage joue, mais modérément.", level: "self-care" },
        { label: "Non, aucun lien", detail: "La douleur est indépendante des chaussures.", level: "self-care" },
      ],
    },
  ],
};

/** Compose le questionnaire d'une zone : tronc commun + questions de zone + signes d'alerte. */
export function getQuestionsForZone(zone: Zone): TriageQuestion[] {
  return [...commonLeadQuestions, ...zoneQuestions[zone], alertQuestion];
}

/** Nombre de questions par flux (identique pour toutes les zones). */
export const questionsPerFlow = commonLeadQuestions.length + zoneQuestions.Cheville.length + 1;

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
