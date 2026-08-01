/**
 * Conseils pratiques adaptés à chaque trouble : bons réflexes du quotidien,
 * erreurs fréquentes à éviter et signes d'alerte spécifiques.
 */

export type Advice = {
  /** Bons réflexes du quotidien, spécifiques à la pathologie. */
  tips: { title: string; content: string }[];
  /** Erreurs fréquentes qui entretiennent ou aggravent le trouble. */
  avoid: string[];
  /** Signes d'alerte propres à ce trouble. */
  redFlags: string[];
};

/** Signes d'alerte valables quel que soit le trouble du membre inférieur. */
export const generalRedFlags = [
  "Impossibilité de poser le pied au sol ou de faire 4 pas",
  "Déformation visible du membre après un traumatisme",
  "Pied froid, pâle, engourdi ou fourmillements persistants",
  "Fièvre associée à une articulation chaude, rouge et gonflée",
  "Douleur intense au repos ou qui réveille la nuit",
  "Mollet douloureux, dur et gonflé d'un seul côté (suspicion de phlébite)",
];

export const conditionAdvice: Record<string, Advice> = {
  "entorse-cheville": {
    tips: [
      { title: "Glace les 48 premières heures", content: "Poche de glace enveloppée dans un linge, 15 à 20 min, 3 à 5 fois par jour, pour calmer la douleur et le gonflement." },
      { title: "Surélever la cheville", content: "Dès que vous êtes assis ou allongé, placez le pied au-dessus du niveau du cœur avec un coussin sous le mollet." },
      { title: "Compression douce", content: "Bandage élastique ou chevillère la journée. Il doit être ferme mais ne jamais faire bleuir ou fourmiller les orteils." },
      { title: "Remarcher tôt", content: "Dès que l'appui devient supportable, reprenez la marche protégée : l'immobilisation prolongée retarde la récupération." },
      { title: "Chaussage stable", content: "Chaussures fermées, plates, à semelle rigide. Évitez les tongs et les chaussons mous pendant quelques semaines." },
      { title: "Proprioception", content: "Après la phase douloureuse, travaillez l'équilibre sur un pied quelques minutes par jour : c'est ce qui évite la récidive." },
    ],
    avoid: [
      "Chaleur, massage profond et alcool dans les 48 premières heures",
      "Reprendre le sport sans avoir retrouvé l'équilibre sur un pied",
      "Garder une attelle en continu au-delà des délais prescrits",
    ],
    redFlags: [
      "Douleur osseuse à la pression du bord de la malléole ou du bord externe du pied",
      "Sensation de dérobement répétée de la cheville",
      "Gonflement qui persiste identique au-delà de 3 semaines",
    ],
  },

  "arthrose-genou": {
    tips: [
      { title: "Bouger tous les jours", content: "30 minutes de marche, vélo ou natation : le cartilage se nourrit du mouvement. L'inactivité aggrave la douleur." },
      { title: "Renforcer le quadriceps", content: "Extensions de genou assis et montées de chaise quotidiennes : un quadriceps fort protège l'articulation." },
      { title: "Chaleur avant, froid après", content: "Chaleur le matin pour dérouiller le genou, froid après un effort ou en cas de gonflement." },
      { title: "Alléger la charge", content: "Chaque kilo perdu réduit environ 4 kg de contrainte sur le genou à la marche." },
      { title: "Adapter la maison", content: "Évitez les sièges bas, préférez les escaliers marche par marche, utilisez la rampe en descente." },
      { title: "Gérer les poussées", content: "En cas de genou gonflé et chaud, réduisez l'activité 2 à 3 jours sans jamais arrêter complètement de marcher." },
    ],
    avoid: [
      "Le repos strict prolongé, qui fait fondre le muscle et augmente la douleur",
      "Les squats profonds, la position accroupie et les impacts répétés (course sur bitume)",
      "Attendre l'usure complète avant de commencer la kinésithérapie",
    ],
    redFlags: [
      "Genou brutalement chaud, rouge et gonflé avec fièvre",
      "Blocage vrai du genou en flexion",
      "Périmètre de marche qui s'effondre en quelques semaines",
    ],
  },

  "aponevrosite-plantaire": {
    tips: [
      { title: "Étirements du matin", content: "Avant de poser le pied au sol, tirez les orteils vers vous 30 secondes, 3 fois : cela évite la douleur des premiers pas." },
      { title: "Massage au rouleau", content: "Roulez la voûte plantaire sur une balle ou une bouteille d'eau froide 5 minutes, matin et soir." },
      { title: "Étirer le mollet", content: "Mollet tendu contre un mur, 3 x 30 secondes, deux fois par jour : c'est le mollet raide qui tire sur l'aponévrose." },
      { title: "Ne jamais marcher pieds nus", content: "À la maison aussi : chaussons ou sandales avec un talon amortissant, surtout sur carrelage ou parquet." },
      { title: "Talonnette amortissante", content: "Une talonnette en silicone ou une semelle amortissante réduit nettement la douleur d'appui." },
      { title: "Fractionner la station debout", content: "Alternez debout et assis plutôt que de rester 2 heures sur place, puis de tout stopper." },
    ],
    avoid: [
      "Les infiltrations répétées de corticoïdes sans avis spécialisé",
      "Les chaussures plates et souples (ballerines, tongs) et la marche pieds nus",
      "Arrêter les étirements dès que la douleur diminue : la rechute est fréquente",
    ],
    redFlags: [
      "Douleur du talon apparue brutalement avec un claquement (rupture)",
      "Douleur nocturne du talon, indépendante de l'appui",
      "Fourmillements ou décharges électriques vers la plante du pied",
    ],
  },

  "syndrome-rotulien": {
    tips: [
      { title: "Renforcer sans douleur", content: "Quadriceps et fessiers en amplitude réduite (chaise, pont fessier) : le renforcement est le traitement principal." },
      { title: "Éviter les positions longues", content: "En voiture ou au cinéma, tendez la jambe régulièrement : le genou plié immobile réveille la douleur." },
      { title: "Descendre autrement", content: "Descendez les escaliers marche par marche, en poussant sur la jambe non douloureuse." },
      { title: "Chercher l'origine à la hanche", content: "Un bassin instable surcharge la rotule : les exercices de fessiers moyens sont souvent la clé." },
      { title: "Doser la course", content: "Réduisez volume et dénivelé négatif plutôt que d'arrêter, et augmentez de 10 % maximum par semaine." },
      { title: "Étirer la chaîne antérieure", content: "Quadriceps et fléchisseurs de hanche, 2 x 30 secondes après chaque séance." },
    ],
    avoid: [
      "Les squats profonds, la presse à cuisses lourde et les fentes douloureuses",
      "Le repos total : la douleur revient dès la reprise si le muscle n'a pas été renforcé",
      "Courir en descente tant que la douleur est présente",
    ],
    redFlags: [
      "Genou qui lâche complètement avec chute",
      "Gonflement important et récidivant du genou",
      "Blocage articulaire vrai",
    ],
  },

  "tendinopathie-achille": {
    tips: [
      { title: "Travail excentrique", content: "Montées sur pointes puis descente lente sur la jambe douloureuse, 3 x 15, tous les jours : c'est le traitement de référence." },
      { title: "Douleur tolérable", content: "Une douleur jusqu'à 3-4/10 pendant l'exercice est acceptable si elle disparaît en 24 h." },
      { title: "Talonnette temporaire", content: "Une talonnette de 8 à 12 mm dans les deux chaussures détend le tendon les premières semaines." },
      { title: "Échauffer avant l'effort", content: "10 minutes de marche rapide avant de courir : le tendon a besoin d'être progressivement mis en charge." },
      { title: "Réduire, pas arrêter", content: "Diminuez le volume et les côtes plutôt que de stopper totalement : le tendon a besoin de charge pour cicatriser." },
      { title: "Soigner le sommeil et l'alimentation", content: "La cicatrisation tendineuse est lente : sommeil, hydratation et apports protéiques comptent." },
    ],
    avoid: [
      "Les étirements passifs forcés et les massages agressifs sur le tendon douloureux",
      "L'infiltration de corticoïdes dans le tendon (risque de rupture)",
      "Reprendre le même volume de course dès que la douleur cède",
    ],
    redFlags: [
      "Claquement brutal avec impossibilité de monter sur la pointe du pied (rupture du tendon)",
      "Creux palpable sur le trajet du tendon",
      "Tendon chaud, rouge et gonflé avec fièvre",
    ],
  },

  "lesion-meniscale": {
    tips: [
      { title: "Protéger sans immobiliser", content: "Évitez les rotations en charge, mais continuez à marcher et à plier doucement le genou." },
      { title: "Glace et surélévation", content: "En cas de gonflement, 15 minutes de glace 3 fois par jour, jambe surélevée." },
      { title: "Entretenir le quadriceps", content: "Contractions statiques jambe tendue plusieurs fois par jour pour éviter la fonte musculaire." },
      { title: "Adapter le sport", content: "Vélo et natation (sans brasse) plutôt que football, tennis ou ski pendant la phase douloureuse." },
      { title: "Repérer les accrochages", content: "Notez les mouvements qui bloquent le genou : c'est une information utile au médecin." },
      { title: "Ne pas forcer un blocage", content: "Si le genou reste bloqué en flexion, ne tentez pas de le débloquer vous-même." },
    ],
    avoid: [
      "S'accroupir complètement et pivoter sur la jambe d'appui",
      "Demander une arthroscopie d'emblée : chez l'adulte, la rééducation est souvent aussi efficace",
      "Marcher longtemps sur un genou qui gonfle à chaque effort",
    ],
    redFlags: [
      "Genou bloqué en flexion, impossible à tendre",
      "Gonflement massif dans les heures suivant le traumatisme",
      "Instabilité avec dérobements (possible atteinte ligamentaire associée)",
    ],
  },

  "arthrose-hanche": {
    tips: [
      { title: "Vélo et piscine", content: "Les activités en décharge entretiennent la mobilité sans écraser l'articulation." },
      { title: "Garder l'amplitude", content: "Quelques minutes par jour d'écartement et de rotation douce de la hanche pour ne pas enraidir." },
      { title: "Aides du quotidien", content: "Enfile-chaussettes, chausse-pied long et siège rehaussé rendent l'habillage bien plus simple." },
      { title: "Canne du bon côté", content: "La canne se tient du côté opposé à la hanche douloureuse : elle réduit fortement la charge." },
      { title: "Fractionner la marche", content: "Plusieurs sorties courtes valent mieux qu'une longue marche qui déclenche la douleur." },
      { title: "Gérer le poids", content: "La perte de poids soulage nettement la hanche à chaque pas." },
    ],
    avoid: [
      "Rester assis très longtemps sans se lever (la reprise est alors très douloureuse)",
      "La course à pied et les sports d'impact sur une hanche arthrosique douloureuse",
      "Attendre d'être immobilisé pour prendre un avis chirurgical",
    ],
    redFlags: [
      "Douleur de hanche avec fièvre",
      "Impossibilité soudaine de prendre appui",
      "Douleur nocturne permanente non calmée par le repos",
    ],
  },

  metatarsalgie: {
    tips: [
      { title: "Chaussures larges", content: "Un avant-pied qui n'est pas comprimé, avec une semelle épaisse et un talon de 2 à 3 cm maximum." },
      { title: "Semelle de décharge", content: "Un appui rétro-capital (barre placée juste en arrière des têtes métatarsiennes) soulage très rapidement." },
      { title: "Soigner les durillons", content: "Ponçage doux et hydratation quotidienne, sans découper la corne soi-même." },
      { title: "Muscler le pied", content: "Exercices d'agrippement d'une serviette avec les orteils, 2 minutes par jour." },
      { title: "Étirer le mollet", content: "Un mollet raide augmente l'appui sur l'avant-pied : étirez-le matin et soir." },
      { title: "Alterner les chaussures", content: "Changez de paire dans la journée pour varier les zones d'appui." },
    ],
    avoid: [
      "Les talons hauts et les chaussures à bout pointu",
      "Les longues stations debout sur sol dur sans pause",
      "Les semelles achetées sans analyse d'appui si la douleur persiste",
    ],
    redFlags: [
      "Douleur brutale de l'avant-pied après un effort prolongé (fracture de fatigue)",
      "Décharges électriques entre deux orteils avec engourdissement (névrome)",
      "Avant-pied rouge, chaud et gonflé avec fièvre",
    ],
  },

  "syndrome-essuie-glace": {
    tips: [
      { title: "Réduire le déclencheur", content: "Courez en dessous de la distance qui déclenche la douleur, sur terrain plat, quelques semaines." },
      { title: "Renforcer les fessiers", content: "Abductions de hanche et pont fessier unipodal, 3 séries, 3 fois par semaine." },
      { title: "Augmenter la cadence", content: "Des foulées plus courtes et plus fréquentes réduisent la friction sur le côté du genou." },
      { title: "Éviter le dévers", content: "Alternez les côtés de la route et évitez les longues descentes pendant la phase douloureuse." },
      { title: "Vérifier la selle", content: "À vélo, une selle trop haute ou des cales mal réglées entretiennent le frottement." },
      { title: "Chaleur avant l'effort", content: "Un échauffement progressif de 10 minutes limite l'apparition de la douleur." },
    ],
    avoid: [
      "Le foam roller très appuyé directement sur le point douloureux du genou",
      "Reprendre le volume d'entraînement d'avant dès la disparition de la douleur",
      "Étirer la bandelette en pensant l'assouplir : c'est la hanche qu'il faut renforcer",
    ],
    redFlags: [
      "Gonflement du genou (inhabituel dans ce syndrome)",
      "Douleur externe persistante au repos ou la nuit",
      "Douleur qui apparaît désormais dès les premières minutes de marche",
    ],
  },

  "hallux-valgus": {
    tips: [
      { title: "Chaussage large", content: "Un avant-pied souple et large, sans couture sur l'oignon, réduit la douleur de frottement." },
      { title: "Protection locale", content: "Protège-oignon en silicone ou pansement épais pour éviter la rougeur et l'irritation." },
      { title: "Orthèse de nuit", content: "Une orthèse nocturne ne redresse pas l'orteil mais limite la gêne et l'enraidissement." },
      { title: "Écarteur d'orteil", content: "Un écarteur en silicone entre les deux premiers orteils soulage à la marche." },
      { title: "Mobiliser le gros orteil", content: "Quelques minutes de mobilisation manuelle douce par jour pour conserver la souplesse." },
      { title: "Renforcer l'abducteur", content: "Exercices d'écartement actif du gros orteil, sur conseil du podologue ou du kiné." },
    ],
    avoid: [
      "Les chaussures pointues et les talons hauts, qui accélèrent la déviation",
      "Opérer un hallux valgus non douloureux pour des raisons esthétiques seules",
      "Percer ou traiter soi-même une bursite rouge et chaude sur l'oignon",
    ],
    redFlags: [
      "Oignon rouge, chaud, avec écoulement ou fièvre (infection)",
      "Plaie qui ne cicatrise pas, en particulier chez le diabétique",
      "Orteils voisins qui se déforment rapidement (griffes)",
    ],
  },
};
