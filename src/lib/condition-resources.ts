/**
 * Ressources complémentaires par trouble : exercices simples à faire chez soi
 * et liens d'information fiables (vidéos, sites de référence).
 *
 * Les liens vidéo pointent vers une recherche YouTube ciblée plutôt que vers
 * une vidéo unique : les URL de vidéos disparaissent, la recherche reste valide
 * et remonte les contenus récents de kinés et de sociétés savantes.
 */

export type Exercise = {
  title: string;
  /** Comment le faire, en langage simple. */
  how: string;
  /** Rythme conseillé. */
  dosage: string;
};

export type ResourceLink = {
  label: string;
  url: string;
  /** Type de ressource, pour l'affichage. */
  kind: "video" | "site";
  source: string;
};

export type ConditionResources = {
  exercises: Exercise[];
  links: ResourceLink[];
};

const youtube = (query: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

/** Références utiles quel que soit le trouble du membre inférieur. */
export const generalLinks: ResourceLink[] = [
  {
    label: "Douleurs musculo-squelettiques : comprendre et agir",
    url: "https://www.ameli.fr/assure/sante/themes",
    kind: "site",
    source: "Ameli (Assurance Maladie)",
  },
  {
    label: "Activité physique adaptée : recommandations",
    url: "https://www.has-sante.fr/jcms/c_2876862/fr/prescription-d-activite-physique-et-sportive",
    kind: "site",
    source: "Haute Autorité de Santé",
  },
  {
    label: "Bouger sur ordonnance : conseils en vidéo",
    url: youtube("kinésithérapie exercices membre inférieur conseils kiné"),
    kind: "video",
    source: "Recherche YouTube",
  },
];

export const conditionResources: Record<string, ConditionResources> = {
  "entorse-cheville": {
    exercises: [
      { title: "Mobilité en « alphabet »", how: "Assis, pied en l'air, dessinez lentement les lettres de l'alphabet avec le gros orteil.", dosage: "2 fois par jour, sans douleur vive" },
      { title: "Équilibre sur un pied", how: "Debout près d'un mur, tenez-vous sur la jambe blessée, d'abord yeux ouverts puis fermés.", dosage: "3 x 30 secondes, tous les jours" },
      { title: "Élastique en éversion", how: "Élastique autour de l'avant-pied, poussez le pied vers l'extérieur puis revenez lentement.", dosage: "3 x 15, un jour sur deux" },
    ],
    links: [
      { label: "Rééducation d'entorse de cheville en vidéo", url: youtube("rééducation entorse cheville exercices kiné"), kind: "video", source: "Recherche YouTube" },
      { label: "Entorse de la cheville : que faire ?", url: "https://www.ameli.fr/assure/sante/themes/entorse-cheville", kind: "site", source: "Ameli" },
    ],
  },

  "arthrose-genou": {
    exercises: [
      { title: "Extension de genou assis", how: "Assis sur une chaise, tendez la jambe à l'horizontale et tenez 5 secondes.", dosage: "3 x 10 par jambe, tous les jours" },
      { title: "Lever de chaise", how: "S'asseoir et se relever sans les mains, lentement, en contrôlant la descente.", dosage: "3 x 8, un jour sur deux" },
      { title: "Vélo d'appartement léger", how: "Selle haute, résistance faible, sans jamais forcer sur la douleur.", dosage: "10 à 20 minutes par jour" },
    ],
    links: [
      { label: "Exercices pour l'arthrose du genou", url: youtube("exercices arthrose genou gonarthrose kiné"), kind: "video", source: "Recherche YouTube" },
      { label: "Arthrose du genou (gonarthrose)", url: "https://www.ameli.fr/assure/sante/themes/arthrose-genou", kind: "site", source: "Ameli" },
    ],
  },

  "aponevrosite-plantaire": {
    exercises: [
      { title: "Étirement avant le lever", how: "Assis au bord du lit, tirez les orteils vers vous, genou tendu.", dosage: "3 x 30 secondes, avant de poser le pied" },
      { title: "Roulage sur balle froide", how: "Roulez la voûte plantaire sur une balle de tennis ou une bouteille froide.", dosage: "5 minutes matin et soir" },
      { title: "Montées sur pointes serviette", how: "Une serviette roulée sous les orteils, montez lentement sur la pointe puis redescendez.", dosage: "3 x 12, un jour sur deux" },
    ],
    links: [
      { label: "Fasciite plantaire : exercices et étirements", url: youtube("aponévrosite plantaire fasciite exercices étirements kiné"), kind: "video", source: "Recherche YouTube" },
      { label: "Douleur du talon : conseils", url: "https://www.ameli.fr/assure/sante/themes/douleur-pied", kind: "site", source: "Ameli" },
    ],
  },

  "syndrome-rotulien": {
    exercises: [
      { title: "Pont fessier", how: "Allongé sur le dos, genoux pliés, décollez le bassin en serrant les fessiers.", dosage: "3 x 12, tous les deux jours" },
      { title: "Abduction de hanche couchée", how: "Sur le côté, levez la jambe du dessus tendue, sans basculer le bassin.", dosage: "3 x 15 par côté" },
      { title: "Mini-squat mur", how: "Dos au mur, descendez seulement jusqu'à 45°, sans douleur.", dosage: "3 x 10, lentement" },
    ],
    links: [
      { label: "Syndrome fémoro-patellaire : programme d'exercices", url: youtube("syndrome rotulien fémoro patellaire exercices kiné"), kind: "video", source: "Recherche YouTube" },
      { label: "Douleur du genou : quand consulter", url: "https://www.ameli.fr/assure/sante/themes/douleur-genou", kind: "site", source: "Ameli" },
    ],
  },

  "tendinopathie-achille": {
    exercises: [
      { title: "Excentrique sur marche", how: "Montez sur les deux pointes, puis descendez lentement sur la jambe douloureuse seule.", dosage: "3 x 15, tous les jours pendant 12 semaines" },
      { title: "Isométrique mollet", how: "Sur la pointe des pieds, tenez la position sans bouger.", dosage: "5 x 45 secondes, en cas de douleur vive" },
      { title: "Étirement du mollet au mur", how: "Jambe arrière tendue, talon au sol, avancez le bassin doucement.", dosage: "3 x 30 secondes, deux fois par jour" },
    ],
    links: [
      { label: "Tendinopathie d'Achille : protocole excentrique", url: youtube("tendinopathie achille exercices excentriques protocole"), kind: "video", source: "Recherche YouTube" },
      { label: "Tendinite : comprendre et soigner", url: "https://www.ameli.fr/assure/sante/themes/tendinite", kind: "site", source: "Ameli" },
    ],
  },

  "lesion-meniscale": {
    exercises: [
      { title: "Contraction statique du quadriceps", how: "Jambe tendue, écrasez le genou vers le sol en serrant la cuisse.", dosage: "3 x 10 tenues de 5 secondes, plusieurs fois par jour" },
      { title: "Flexion-extension assise", how: "Assis, pliez et tendez le genou dans l'amplitude non douloureuse.", dosage: "2 x 15, deux fois par jour" },
      { title: "Vélo sans résistance", how: "Pédalage souple, selle un peu haute pour limiter la flexion.", dosage: "10 à 15 minutes par jour" },
    ],
    links: [
      { label: "Lésion méniscale : rééducation sans chirurgie", url: youtube("lésion méniscale rééducation exercices kiné genou"), kind: "video", source: "Recherche YouTube" },
      { label: "Lésion du ménisque", url: "https://www.ameli.fr/assure/sante/themes/douleur-genou", kind: "site", source: "Ameli" },
    ],
  },

  "arthrose-hanche": {
    exercises: [
      { title: "Rotation douce en décharge", how: "Allongé, jambe tendue, tournez lentement le pied vers l'intérieur puis l'extérieur.", dosage: "2 x 15, tous les jours" },
      { title: "Abduction debout", how: "Appui sur une chaise, écartez la jambe sur le côté sans pencher le buste.", dosage: "3 x 12 par côté" },
      { title: "Vélo ou piscine", how: "Activités en décharge, sans impact, à intensité modérée.", dosage: "20 à 30 minutes, 3 fois par semaine" },
    ],
    links: [
      { label: "Exercices pour l'arthrose de hanche", url: youtube("exercices arthrose hanche coxarthrose kiné"), kind: "video", source: "Recherche YouTube" },
      { label: "Arthrose de la hanche (coxarthrose)", url: "https://www.ameli.fr/assure/sante/themes/arthrose-hanche", kind: "site", source: "Ameli" },
    ],
  },

  metatarsalgie: {
    exercises: [
      { title: "Agripper une serviette", how: "Pied nu, ramenez une serviette vers vous avec les orteils uniquement.", dosage: "2 minutes par jour" },
      { title: "Étirement des orteils", how: "Main sous les orteils, remontez-les doucement vers le dessus du pied.", dosage: "3 x 30 secondes" },
      { title: "Étirement du mollet", how: "Contre un mur, jambe arrière tendue, talon collé au sol.", dosage: "3 x 30 secondes, matin et soir" },
    ],
    links: [
      { label: "Métatarsalgie : exercices et conseils de chaussage", url: youtube("métatarsalgie exercices conseils podologue"), kind: "video", source: "Recherche YouTube" },
      { label: "Douleurs du pied : conseils", url: "https://www.ameli.fr/assure/sante/themes/douleur-pied", kind: "site", source: "Ameli" },
    ],
  },

  "syndrome-essuie-glace": {
    exercises: [
      { title: "Abduction élastique debout", how: "Élastique aux chevilles, écartez la jambe latéralement, bassin stable.", dosage: "3 x 15 par côté, 3 fois par semaine" },
      { title: "Pont fessier unipodal", how: "Pont fessier une jambe tendue en l'air, bassin bien horizontal.", dosage: "3 x 8 par côté" },
      { title: "Marche latérale élastique", how: "Élastique au-dessus des genoux, pas chassés en demi-flexion.", dosage: "3 x 15 pas dans chaque sens" },
    ],
    links: [
      { label: "Syndrome de la bandelette ilio-tibiale : exercices", url: youtube("syndrome essuie glace bandelette ilio-tibiale exercices coureur"), kind: "video", source: "Recherche YouTube" },
      { label: "Douleur du genou chez le coureur", url: "https://www.ameli.fr/assure/sante/themes/douleur-genou", kind: "site", source: "Ameli" },
    ],
  },

  "hallux-valgus": {
    exercises: [
      { title: "Écartement actif du gros orteil", how: "Pied à plat, essayez d'écarter le gros orteil des autres sans lever le pied.", dosage: "3 x 10, tous les jours" },
      { title: "Mobilisation manuelle", how: "Prenez le gros orteil et mobilisez-le doucement en flexion-extension.", dosage: "2 minutes par pied et par jour" },
      { title: "Montées sur pointes contrôlées", how: "Montez lentement sur la pointe en gardant l'appui sur le gros orteil.", dosage: "3 x 12, un jour sur deux" },
    ],
    links: [
      { label: "Hallux valgus : exercices et prévention", url: youtube("hallux valgus exercices podologue prévention"), kind: "video", source: "Recherche YouTube" },
      { label: "Hallux valgus (oignon du pied)", url: "https://www.ameli.fr/assure/sante/themes/hallux-valgus", kind: "site", source: "Ameli" },
    ],
  },
};
