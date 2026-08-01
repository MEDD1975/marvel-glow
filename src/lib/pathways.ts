/**
 * Parcours de soin gradué par pathologie : qui voir, dans quel ordre,
 * avec quel délai, et quand passer à la ligne de recours suivante.
 */

export type CareLine = 1 | 2 | 3;

export type PathwayActor = {
  line: CareLine;
  role: string;
  /** Ce que ce professionnel apporte concrètement pour cette pathologie. */
  mission: string;
  /** Le moment / la condition qui déclenche cette consultation. */
  trigger: string;
  /** Délai indicatif pour obtenir ce rendez-vous. */
  delay: string;
};

export type PathwayMilestone = {
  period: string;
  title: string;
  goal: string;
};

export type CarePathway = {
  /** Point d'entrée conseillé dans le système de soin. */
  entry: string;
  actors: PathwayActor[];
  milestones: PathwayMilestone[];
  /** Situations qui font sauter des étapes et accélérer le recours. */
  escalation: string[];
};

const GP: Omit<PathwayActor, "trigger" | "delay"> = {
  line: 1,
  role: "Médecin généraliste",
  mission: "Pose le diagnostic, élimine les urgences, prescrit imagerie, antalgiques et kinésithérapie.",
};

export const pathways: Record<string, CarePathway> = {
  "entorse-cheville": {
    entry: "Médecin généraliste ou urgences le jour même si l'appui est impossible.",
    actors: [
      { ...GP, trigger: "Dès les premières 48 h, pour appliquer les critères d'Ottawa et décider d'une radiographie.", delay: "24 à 48 h" },
      { line: 1, role: "Urgences / traumatologie", mission: "Radiographie immédiate, immobilisation, exclusion d'une fracture malléolaire.", trigger: "Impossibilité de faire 4 pas, déformation, douleur majeure.", delay: "Le jour même" },
      { line: 2, role: "Kinésithérapeute", mission: "Remise en charge progressive, mobilité, renforcement des fibulaires, proprioception.", trigger: "Dès J3-J7, sur prescription, même pour une entorse bénigne.", delay: "Sous 1 semaine" },
      { line: 2, role: "Médecin du sport", mission: "Évalue la laxité résiduelle et valide le retour au sport ou au travail physique.", trigger: "Sportif, ou douleur persistante au-delà de 6 semaines.", delay: "2 à 4 semaines" },
      { line: 3, role: "Chirurgien orthopédiste (pied-cheville)", mission: "Bilan d'instabilité chronique, IRM, discussion d'une ligamentoplastie.", trigger: "Entorses à répétition ou instabilité après 3 à 6 mois de rééducation bien conduite.", delay: "1 à 2 mois" },
      { line: 3, role: "Podologue", mission: "Semelles et travail de l'appui pour limiter la récidive.", trigger: "Récidives, pied creux ou varus d'arrière-pied.", delay: "Non urgent" },
    ],
    milestones: [
      { period: "J0 – J3", title: "Phase aiguë", goal: "Protéger, glacer, comprimer, surélever. Diagnostic médical." },
      { period: "J3 – S2", title: "Remise en charge", goal: "Marche protégée, début de kinésithérapie, récupération de la mobilité." },
      { period: "S2 – S6", title: "Rééducation active", goal: "Renforcement et proprioception, reprise des activités quotidiennes." },
      { period: "S6 – S12", title: "Retour au sport", goal: "Réathlétisation, tests de saut, prévention des récidives." },
    ],
    escalation: [
      "Appui impossible ou douleur osseuse à la palpation des malléoles → radiographie en urgence.",
      "Aucune amélioration à 6 semaines de rééducation → avis médecin du sport ou orthopédiste.",
      "Sensation de dérobement répétée → bilan d'instabilité chronique.",
    ],
  },

  "arthrose-genou": {
    entry: "Médecin généraliste, avec radiographies des genoux en charge.",
    actors: [
      { ...GP, trigger: "Douleur mécanique du genou installée depuis plus de quelques semaines.", delay: "1 à 2 semaines" },
      { line: 2, role: "Kinésithérapeute", mission: "Renforcement du quadriceps et des fessiers, reconditionnement à l'effort, économie articulaire.", trigger: "Dès le diagnostic posé : c'est le traitement de première intention.", delay: "Sous 2 semaines" },
      { line: 2, role: "Rhumatologue", mission: "Confirme le diagnostic, gère les poussées, infiltrations (corticoïdes, acide hyaluronique).", trigger: "Poussées inflammatoires, doute diagnostique, échec du traitement initial.", delay: "1 à 3 mois" },
      { line: 2, role: "Diététicien / activité physique adaptée", mission: "Réduction de la charge articulaire et maintien d'une activité régulière.", trigger: "Surpoids ou sédentarité associés.", delay: "Non urgent" },
      { line: 3, role: "Chirurgien orthopédiste (genou)", mission: "Discussion d'une prothèse ou d'une ostéotomie.", trigger: "Douleur invalidante, périmètre de marche réduit, échec du traitement médical bien conduit.", delay: "2 à 6 mois" },
    ],
    milestones: [
      { period: "M0", title: "Diagnostic", goal: "Radiographies en charge, évaluation de la douleur et du périmètre de marche." },
      { period: "M0 – M3", title: "Traitement de fond", goal: "Kinésithérapie, activité adaptée, antalgiques, gestion du poids." },
      { period: "M3 – M6", title: "Réévaluation", goal: "Mesurer le gain fonctionnel, envisager infiltrations si échec." },
      { period: "Au long cours", title: "Suivi", goal: "Réévaluation tous les 6 à 12 mois, chirurgie si handicap majeur." },
    ],
    escalation: [
      "Genou chaud, rouge, avec fièvre → avis médical urgent (arthrite septique).",
      "Blocage articulaire brutal → suspicion de lésion méniscale associée.",
      "Réveils nocturnes et périmètre de marche < 15 min → avis chirurgical.",
    ],
  },

  "aponevrosite-plantaire": {
    entry: "Médecin généraliste ou kinésithérapeute en accès direct selon votre organisation locale.",
    actors: [
      { ...GP, trigger: "Douleur du talon aux premiers pas persistant plus de 3 semaines.", delay: "2 à 3 semaines" },
      { line: 2, role: "Kinésithérapeute", mission: "Étirements de l'aponévrose et du triceps, renforcement excentrique, ondes de choc selon les centres.", trigger: "Dès la confirmation du diagnostic.", delay: "Sous 2 semaines" },
      { line: 2, role: "Podologue", mission: "Analyse de l'appui, semelles orthopédiques, conseils de chaussage.", trigger: "Douleur persistante à 6 semaines ou trouble statique du pied.", delay: "3 à 6 semaines" },
      { line: 3, role: "Médecin du sport / rhumatologue", mission: "Échographie, infiltration échoguidée, recherche d'une cause inflammatoire.", trigger: "Échec à 3-6 mois de traitement bien conduit.", delay: "1 à 2 mois" },
      { line: 3, role: "Chirurgien orthopédiste (pied)", mission: "Geste chirurgical d'exception après échec de tous les traitements conservateurs.", trigger: "Douleur invalidante après 12 mois.", delay: "Programmé" },
    ],
    milestones: [
      { period: "S0 – S6", title: "Auto-soins encadrés", goal: "Étirements quotidiens, chaussage amortissant, réduction des impacts." },
      { period: "S6 – M3", title: "Rééducation structurée", goal: "Renforcement progressif, semelles si nécessaire." },
      { period: "M3 – M6", title: "Réévaluation", goal: "Imagerie et avis spécialisé si la douleur persiste." },
    ],
    escalation: [
      "Douleur nocturne permanente ou fièvre → avis médical rapide.",
      "Douleur brutale avec craquement à l'effort → suspicion de rupture, avis urgent.",
      "Fourmillements du bord interne du pied → recherche d'un syndrome du tunnel tarsien.",
    ],
  },

  "syndrome-rotulien": {
    entry: "Kinésithérapeute en première intention, médecin si la douleur résiste.",
    actors: [
      { line: 1, role: "Kinésithérapeute", mission: "Renforcement quadricipital et fessier, correction du contrôle du genou, gestion de charge.", trigger: "Dès l'apparition d'une douleur antérieure de genou à l'effort.", delay: "Sous 2 semaines" },
      { ...GP, trigger: "Douleur persistante, gonflement, ou doute sur un autre diagnostic.", delay: "2 à 4 semaines" },
      { line: 2, role: "Médecin du sport", mission: "Analyse de la charge d'entraînement et du geste sportif, adaptation du programme.", trigger: "Sportif régulier, récidives à chaque reprise.", delay: "1 mois" },
      { line: 2, role: "Podologue", mission: "Corrige un excès de pronation ou un déséquilibre d'appui.", trigger: "Trouble statique associé.", delay: "Non urgent" },
      { line: 3, role: "Chirurgien orthopédiste (genou)", mission: "Bilan d'instabilité rotulienne, IRM, geste de réalignement rare.", trigger: "Luxations rotuliennes, échec de 6 mois de rééducation.", delay: "1 à 3 mois" },
    ],
    milestones: [
      { period: "S0 – S6", title: "Réduction des contraintes", goal: "Éviter les mouvements douloureux, débuter le renforcement." },
      { period: "S6 – S12", title: "Renforcement progressif", goal: "Charge croissante, contrôle du genou en fente et en descente." },
      { period: "S12+", title: "Reprise", goal: "Retour progressif à la course et au sport." },
    ],
    escalation: [
      "Genou qui se dérobe ou se bloque → avis médical.",
      "Épanchement articulaire répété → imagerie.",
      "Douleur nocturne inhabituelle → consultation médicale.",
    ],
  },

  "tendinopathie-achille": {
    entry: "Kinésithérapeute ou médecin du sport, selon l'accès.",
    actors: [
      { line: 1, role: "Kinésithérapeute", mission: "Protocole excentrique / charge lente progressive, adaptation du volume de course.", trigger: "Dès les premières semaines de douleur au tendon.", delay: "Sous 2 semaines" },
      { ...GP, trigger: "Douleur persistante, prise de fluoroquinolones, ou doute diagnostique.", delay: "2 à 3 semaines" },
      { line: 2, role: "Médecin du sport", mission: "Échographie, planification de la reprise, gestion des facteurs de risque.", trigger: "Pas d'amélioration après 6 à 8 semaines de rééducation.", delay: "1 mois" },
      { line: 2, role: "Podologue", mission: "Talonnettes et semelles pour diminuer la contrainte sur le tendon.", trigger: "Trouble d'appui ou chaussage inadapté.", delay: "Non urgent" },
      { line: 3, role: "Chirurgien orthopédiste (pied-cheville)", mission: "Traitement des formes rebelles ou des ruptures partielles.", trigger: "Échec après 6 à 12 mois de traitement conservateur.", delay: "Programmé" },
    ],
    milestones: [
      { period: "S0 – S6", title: "Mise en charge contrôlée", goal: "Baisse du volume d'impact, début du travail excentrique." },
      { period: "S6 – M3", title: "Renforcement progressif", goal: "Augmentation de charge, retour au trottinement." },
      { period: "M3 – M6", title: "Réathlétisation", goal: "Retour au volume d'entraînement antérieur sans douleur résiduelle." },
    ],
    escalation: [
      "Claquement brutal avec impossibilité de se mettre sur la pointe du pied → urgence (rupture du tendon).",
      "Tendon chaud, rouge, douloureux au repos → avis médical rapide.",
      "Traitement récent par fluoroquinolones ou corticoïdes → avis médical avant tout effort.",
    ],
  },

  "lesion-meniscale": {
    entry: "Médecin généraliste, urgences si le genou reste bloqué en flexion.",
    actors: [
      { ...GP, trigger: "Douleur d'interligne, épanchement ou sensation d'accrochage.", delay: "Quelques jours" },
      { line: 1, role: "Urgences / orthopédiste de garde", mission: "Prise en charge d'un blocage vrai du genou.", trigger: "Genou bloqué, impossible à tendre.", delay: "Le jour même" },
      { line: 2, role: "Kinésithérapeute", mission: "Récupération de l'extension, renforcement, traitement conservateur des lésions dégénératives.", trigger: "Après le diagnostic, en première intention chez l'adulte après 40 ans.", delay: "Sous 1 à 2 semaines" },
      { line: 2, role: "Radiologue (IRM)", mission: "Caractérise la lésion et son caractère opérable.", trigger: "Sur prescription après échec ou en cas de traumatisme sportif.", delay: "2 à 6 semaines" },
      { line: 3, role: "Chirurgien orthopédiste (genou)", mission: "Arthroscopie : suture méniscale chez le jeune, méniscectomie économe si nécessaire.", trigger: "Lésion traumatique symptomatique ou échec du traitement conservateur à 3 mois.", delay: "1 à 2 mois" },
    ],
    milestones: [
      { period: "J0 – S2", title: "Phase initiale", goal: "Repos relatif, glace, récupération de l'extension complète." },
      { period: "S2 – M3", title: "Traitement conservateur", goal: "Rééducation structurée, réévaluation clinique." },
      { period: "M3+", title: "Décision", goal: "Chirurgie seulement si les symptômes mécaniques persistent." },
    ],
    escalation: [
      "Genou bloqué en flexion → avis chirurgical en urgence.",
      "Instabilité avec dérobements → recherche d'une lésion ligamentaire associée.",
      "Épanchement massif dans les heures suivant le traumatisme → avis médical rapide.",
    ],
  },

  "arthrose-hanche": {
    entry: "Médecin généraliste avec radiographie de bassin de face.",
    actors: [
      { ...GP, trigger: "Douleur de l'aine à la marche, raideur, boiterie.", delay: "1 à 2 semaines" },
      { line: 2, role: "Kinésithérapeute", mission: "Maintien des amplitudes, renforcement des fessiers, travail de la marche.", trigger: "Dès le diagnostic.", delay: "Sous 2 semaines" },
      { line: 2, role: "Rhumatologue", mission: "Gestion antalgique, infiltrations échoguidées, recherche d'une cause inflammatoire.", trigger: "Douleur mal contrôlée ou tableau atypique.", delay: "1 à 3 mois" },
      { line: 3, role: "Chirurgien orthopédiste (hanche)", mission: "Indication et pose d'une prothèse totale de hanche.", trigger: "Douleur permanente, périmètre de marche très réduit, retentissement sur le sommeil.", delay: "2 à 6 mois" },
      { line: 3, role: "Ergothérapeute", mission: "Adaptation du domicile et des gestes avant et après chirurgie.", trigger: "Perte d'autonomie ou chirurgie programmée.", delay: "Selon programme" },
    ],
    milestones: [
      { period: "M0", title: "Diagnostic", goal: "Radiographie, évaluation fonctionnelle." },
      { period: "M0 – M6", title: "Traitement conservateur", goal: "Activité en décharge, kinésithérapie, antalgiques, poids." },
      { period: "M6+", title: "Réévaluation", goal: "Discussion chirurgicale si le handicap progresse." },
    ],
    escalation: [
      "Douleur brutale après une chute chez une personne âgée → suspicion de fracture, urgence.",
      "Fièvre avec douleur de hanche → avis urgent.",
      "Perte rapide de mobilité en quelques semaines → avis spécialisé rapide.",
    ],
  },

  metatarsalgie: {
    entry: "Podologue ou médecin généraliste.",
    actors: [
      { line: 1, role: "Podologue", mission: "Analyse baropodométrique, semelles de décharge, conseils de chaussage.", trigger: "Douleur d'avant-pied à la marche depuis plusieurs semaines.", delay: "2 à 4 semaines" },
      { ...GP, trigger: "Douleur persistante, gonflement, ou suspicion de fracture de fatigue.", delay: "2 à 3 semaines" },
      { line: 2, role: "Radiologue (échographie / IRM)", mission: "Recherche d'un névrome de Morton, d'une bursite ou d'une fracture de fatigue.", trigger: "Douleur localisée persistante malgré les semelles.", delay: "3 à 6 semaines" },
      { line: 2, role: "Kinésithérapeute", mission: "Travail de la mobilité de l'avant-pied et renforcement des intrinsèques.", trigger: "Raideur ou déficit d'appui associé.", delay: "Sous 1 mois" },
      { line: 3, role: "Chirurgien orthopédiste (pied)", mission: "Correction des déformations, geste sur le névrome de Morton.", trigger: "Échec des semelles après 6 mois ou déformation fixée.", delay: "Programmé" },
    ],
    milestones: [
      { period: "S0 – S4", title: "Adaptation", goal: "Chaussage large et amortissant, réduction des stations debout." },
      { period: "S4 – M3", title: "Orthèses", goal: "Semelles de décharge, réévaluation de la douleur." },
      { period: "M3+", title: "Bilan approfondi", goal: "Imagerie et avis spécialisé si la douleur persiste." },
    ],
    escalation: [
      "Douleur brutale après une marche prolongée avec gonflement du dos du pied → suspicion de fracture de fatigue.",
      "Décharges électriques entre les orteils → recherche d'un névrome de Morton.",
      "Pied rouge, chaud, chez un diabétique → avis urgent.",
    ],
  },

  "syndrome-essuie-glace": {
    entry: "Kinésithérapeute du sport en première intention.",
    actors: [
      { line: 1, role: "Kinésithérapeute du sport", mission: "Gestion de charge, renforcement des abducteurs de hanche, travail de la foulée.", trigger: "Douleur externe du genou apparaissant à une distance constante.", delay: "Sous 2 semaines" },
      { ...GP, trigger: "Douleur persistante ou doute diagnostique.", delay: "3 à 4 semaines" },
      { line: 2, role: "Médecin du sport", mission: "Analyse de course, planification de la reprise, infiltration si nécessaire.", trigger: "Récidive à chaque reprise ou échec à 8 semaines.", delay: "1 mois" },
      { line: 2, role: "Podologue du sport", mission: "Correction de l'appui, conseils de chaussures de course.", trigger: "Trouble statique ou usure asymétrique des chaussures.", delay: "Non urgent" },
      { line: 3, role: "Chirurgien orthopédiste", mission: "Geste de libération, très rare.", trigger: "Échec après 6 à 12 mois de traitement conservateur.", delay: "Programmé" },
    ],
    milestones: [
      { period: "S0 – S3", title: "Décharge", goal: "Réduction du volume et des descentes, arrêt temporaire de la course si besoin." },
      { period: "S3 – S8", title: "Renforcement", goal: "Fessiers, contrôle du bassin, gainage." },
      { period: "S8+", title: "Reprise progressive", goal: "Retour à la course par paliers, sans douleur." },
    ],
    escalation: [
      "Gonflement du genou ou blocage → avis médical (autre diagnostic).",
      "Douleur au repos ou la nuit → consultation.",
      "Douleur persistante malgré 3 mois de gestion de charge → avis spécialisé.",
    ],
  },

  "hallux-valgus": {
    entry: "Podologue, puis médecin généraliste si la douleur devient permanente.",
    actors: [
      { line: 1, role: "Podologue", mission: "Orthoplasties, semelles, protection des zones de conflit, conseils de chaussage.", trigger: "Dès la gêne au chaussage ou la rougeur du bord interne du pied.", delay: "2 à 4 semaines" },
      { ...GP, trigger: "Douleur permanente, inflammation, ou retentissement sur la marche.", delay: "2 à 4 semaines" },
      { line: 2, role: "Kinésithérapeute", mission: "Mobilité du gros orteil, renforcement des muscles intrinsèques du pied.", trigger: "Raideur associée ou préparation à une chirurgie.", delay: "Sous 1 mois" },
      { line: 3, role: "Chirurgien orthopédiste (pied)", mission: "Ostéotomie de correction, avec radiographies en charge préalables.", trigger: "Douleur invalidante, chaussage impossible, déformation évolutive.", delay: "3 à 6 mois" },
      { line: 3, role: "Kinésithérapeute post-opératoire", mission: "Récupération de la mobilité et de l'appui après chirurgie.", trigger: "Dès les suites opératoires.", delay: "Selon protocole" },
    ],
    milestones: [
      { period: "M0 – M3", title: "Traitement conservateur", goal: "Chaussage adapté, orthèses, soins locaux." },
      { period: "M3 – M6", title: "Réévaluation", goal: "Mesurer la douleur et la gêne fonctionnelle réelle." },
      { period: "M6+", title: "Décision chirurgicale", goal: "Chirurgie si la douleur limite la marche quotidienne." },
    ],
    escalation: [
      "Plaie ou ulcération au niveau de l'oignon → avis rapide, urgent si diabète.",
      "Rougeur chaude avec fièvre → suspicion d'infection, avis urgent.",
      "Déformation rapidement évolutive avec orteils en griffe → avis chirurgical.",
    ],
  },
};

export const lineLabels: Record<CareLine, { label: string; description: string }> = {
  1: {
    label: "1re ligne — Premier contact",
    description: "Le professionnel à voir en premier : il pose le cadre, élimine l'urgence et oriente.",
  },
  2: {
    label: "2e ligne — Prise en charge spécialisée",
    description: "Les professionnels qui traitent réellement la pathologie sur la durée.",
  },
  3: {
    label: "3e ligne — Recours",
    description: "À solliciter uniquement en cas d'échec ou de forme sévère, souvent sur adressage.",
  },
};
