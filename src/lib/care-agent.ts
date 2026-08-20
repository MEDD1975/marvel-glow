import { createServerFn } from "@tanstack/react-start";
import { generateText, isStepCount, tool } from "ai";
import { z } from "zod";
import { conditions, type Condition, type TriageLevel } from "@/lib/conditions";
import { pathways, lineLabels } from "@/lib/pathways";
import { conditionAdvice, generalRedFlags } from "@/lib/condition-advice";
import { conditionResources, generalLinks, type ResourceLink } from "@/lib/condition-resources";
import { getDoctorVideos } from "@/lib/doctor-content";
import { findProvidersByProfession, professionOrder, type Profession, type Provider } from "@/lib/directory";

// Modèle servi via l'AI Gateway de Vercel (string "provider/model").
const MODEL = "openai/gpt-4.1-mini";

// Phrase de clôture imposée à CHAQUE réponse de l'agent.
const DISCLAIMER =
  "⚠️ Kivoir est un outil d'accompagnement au parcours de soin et ne remplace pas une consultation médicale.";

// System Prompt de « Assistant Kivoir » : rôle, périmètre, règles strictes et style.
const SYSTEM_PROMPT = `Tu es l'Assistant Kivoir, le compagnon intelligent post-consultation d'un patient anonyme. Tu l'aides à faire le point après sa visite chez le médecin et à identifier le bon professionnel au sein du réseau de soins de son cabinet. Tu es factuel, rassurant, pédagogue et rigoureux.

ACCUEIL ET ÉCOUTE :
- Invite la personne à s'exprimer librement sur sa consultation, ce qu'elle ressent maintenant et les conseils, consignes ou prescriptions donnés par son médecin.
- Adapte ta réponse uniquement aux faits qu'elle partage : zone concernée, douleur décrite, évolution ressentie et consignes reçues.
- Si le contexte manque pour orienter utilement, pose une question ouverte et simple, sans transformer l'échange en interrogatoire.
- Ne demande jamais son identité ni une donnée personnelle qui n'est pas nécessaire à l'orientation.

RÈGLES CLINIQUES ABSOLUES :
- Il t'est formellement interdit de poser ou de suggérer un diagnostic médical formel.
- N'interprète jamais une imagerie ou un résultat d'examen et ne prescris jamais de médicament, posologie ou traitement.
- Une déformation visible, une impossibilité totale de prendre appui ou une douleur explicitement évaluée à 10/10 impose une orientation immédiate vers le 15/112 ou les urgences.
- En dehors de ces urgences critiques, recommande une consultation médicale sous 24 à 48 heures lorsque la situation nécessite un examen, avec des conseils d'attente sobres et prudents.
- Reste dans le périmètre du membre inférieur. Pour une autre zone, explique cette limite et invite à consulter.
- Le « Contexte Kivoir » fourni est ta source de vérité : ne l'invente pas et ne le contredis pas.

ANNUAIRE :
- Dès qu'une personne cherche un professionnel à Saint-Maur-des-Fossés, directement ou dans une question naturelle, appelle l'outil rechercherPraticiensSaintMaur.
- Utilise uniquement une profession disponible dans le référentiel de l'outil.
- Après l'appel, présente brièvement l'orientation sans recopier toutes les coordonnées : les cartes sont affichées séparément dans l'interface.
- Si l'outil ne trouve personne, dis-le clairement sans inventer de nom, d'adresse ou de téléphone.

STYLE :
- Vouvoiement systématique, ton bienveillant, clair et mesuré, sans jargon inutile.
- Rédigez de manière fluide et conversationnelle, comme le ferait un professionnel de santé bienveillant.
- N'utilisez jamais de titre, de sous-titre, de liste à puces ni d'en-tête dans la réponse.
- Ne supposez aucune pathologie, aucun symptôme ni aucune circonstance que la personne n'a pas explicitement mentionnés.
- Lorsque la personne partage un symptôme, un diagnostic posé par son médecin ou une prescription, adaptez les conseils de récupération de premier niveau à ces seuls éléments.
- Ne promettez jamais une évolution ou un délai de récupération.
- Réponse concise en deux ou trois paragraphes naturels.

ORIENTATION OBLIGATOIRE :
- Évaluez naturellement s'il est raisonnable de poursuivre la surveillance, de recontacter le médecin ou de consulter un professionnel du réseau. En cas d'urgence, l'appel au 15/112 doit apparaître dès la première phrase.
- Terminez toujours en nommant le profil professionnel le plus adapté aux seuls éléments fournis (par exemple : médecin généraliste, kinésithérapeute, médecin du sport, podologue ou chirurgien orthopédiste), ou indiquez qu'il faut d'abord revoir le médecin lorsque le contexte ne permet pas une orientation plus précise.
- Concluez par une invitation naturelle à consulter l'annuaire du réseau de soins pour trouver ce praticien. Ne fabriquez jamais d'URL : le bouton est ajouté par l'interface.

FIN DE RÉPONSE (obligatoire) :
Termine toujours, sur une nouvelle ligne, par exactement :
${DISCLAIMER}`;

const conversationMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  text: z.string().trim().min(1).max(800),
});

const requestSchema = z.object({
  message: z.string().trim().min(3).max(800),
  zone: z.string().optional(),
  cabinetId: z.string().trim().max(80).optional(),
  history: z.array(conversationMessageSchema).max(8).default([]),
});

export type CareAgentHistoryMessage = z.infer<typeof conversationMessageSchema>;

type CarePlan = {
  level: TriageLevel;
  title: string;
  summary: string;
  condition: string;
  nextStep: string;
  timeline: string;
  stages: { label: string; title: string; detail: string }[];
  escalation: string[];
  resources: string[];
};

// Normalisation robuste (minuscules + suppression des accents) pour la détection de mots-clés.
function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function detectIdentifyingData(message: string): string | null {
  if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(message)) return "une adresse e-mail";
  if (/(?:\+33|0)[1-9](?:[ .-]?\d{2}){4}\b/.test(message)) return "un numéro de téléphone";
  if (/\b[12]\s?\d{2}(?:\s?\d{2}){4}\s?\d{3}\s?\d{2}\b/.test(message)) return "un numéro de sécurité sociale";
  if (/\b(?:je m['’]appelle|mon nom est|je suis monsieur|je suis madame)\s+[a-zà-ÿ'-]{2,}/i.test(message)) {
    return "un nom ou un prénom";
  }
  if (/\b\d{1,4}\s+(?:rue|avenue|boulevard|chemin|impasse|allée)\b/i.test(message)) return "une adresse précise";
  return null;
}

function privacyResponse(reason: string) {
  return `Pour protéger votre anonymat, je n’ai pas transmis ce message car il semble contenir ${reason}. Reformulez votre situation sans nom, prénom, coordonnées, adresse précise ni numéro d’identification. Vous pouvez décrire librement vos symptômes, le diagnostic annoncé par votre médecin et les consignes ou prescriptions reçues.\n\n${DISCLAIMER}`;
}

/**
 * Filtre de sécurité déterministe (red flags). Il s'exécute AVANT tout appel au
 * modèle : la sécurité ne doit jamais dépendre d'une génération IA.
 * Retourne le motif d'urgence détecté, ou null.
 */
function detectRedFlag(message: string): string | null {
  const text = normalize(message);

  if (/\b(deformation|deformee?|fracture ouverte|os visible|os qui sort)\b/.test(text)) {
    return "déformation visible du membre";
  }

  if (
    /(impossibilite totale|totalement impossible|aucun appui|appui totalement impossible)[^.!?]{0,35}(appui|poser le pied|marcher)/.test(
      text,
    ) ||
    /(impossible de poser le pied|impossible de prendre appui)/.test(text)
  ) {
    return "impossibilité totale de prendre appui";
  }

  if (/\bdouleur\b[^.!?]{0,24}\b10\s*(?:\/\s*10)?\b/.test(text)) {
    return "douleur évaluée à 10/10";
  }

  return null;
}

// Message d'urgence renvoyé lorsqu'un red flag est détecté.
function emergencyResponse(reason: string) {
  return [
    "Appelez immédiatement le 15 (SAMU) ou le 112 : n'attendez pas et ne vous rendez pas seul aux urgences.",
    "",
    `Vous avez bien fait de signaler ${reason}. Restez au repos et suivez sans attendre les instructions du service d'urgence. La situation décrite nécessite un avis médical immédiat : l'annuaire ne doit pas retarder votre appel au 15/112.`,
    "",
    "Après la prise en charge urgente, votre médecin généraliste pourra vous aider à organiser la suite avec le professionnel adapté. Vous pourrez alors consulter l'annuaire du réseau de soins pour trouver un praticien.",
    "",
    DISCLAIMER,
  ].join("\n");
}

const practitionerSpecialtySchema = z.enum(professionOrder as [Profession, ...Profession[]]);

type PractitionerSpecialty = z.infer<typeof practitionerSpecialtySchema>;

function searchLocalPractitioners(specialty: PractitionerSpecialty, cabinetId?: string): Provider[] {
  return findProvidersByProfession(specialty, cabinetId);
}

const rechercherPraticiensSaintMaur = tool({
  description:
    "Recherche exhaustive dans l'annuaire local de Saint-Maur-des-Fossés et retourne tous les praticiens enregistrés pour la spécialité choisie. Appeler cet outil dès que l'utilisateur demande, même indirectement ou dans une phrase naturelle, où trouver un médecin généraliste, médecin du sport, kinésithérapeute, podologue ou chirurgien orthopédiste.",
  inputSchema: z.object({
    specialite: practitionerSpecialtySchema.describe("La spécialité exacte à rechercher"),
  }),
  strict: true,
  execute: async ({ specialite }) => ({
    specialite,
    praticiens: searchLocalPractitioners(specialite),
  }),
});

const specialtyMatchers: Array<{ specialty: PractitionerSpecialty; terms: string[] }> = [
  { specialty: "Médecin du sport", terms: ["medecin du sport", "sport"] },
  { specialty: "Chirurgien orthopédiste", terms: ["orthopediste", "chirurgien", "traumatologue"] },
  { specialty: "Kinésithérapeute", terms: ["kine", "kinesitherapeute", "physio", "reeducation"] },
  { specialty: "Podologue", terms: ["podologue", "pedicure", "semelle"] },
  { specialty: "Rhumatologue", terms: ["rhumatologue", "rhumatologie"] },
  { specialty: "Ostéopathe", terms: ["osteopathe", "osteopathie"] },
  { specialty: "Imagerie médicale", terms: ["imagerie", "irm", "radio", "echographie", "scanner"] },
  { specialty: "Médecin généraliste", terms: ["medecin generaliste", "generaliste", "medecin traitant"] },
];

function detectSpecialty(message: string): PractitionerSpecialty | null {
  const normalized = normalize(message);
  return (
    specialtyMatchers.find(({ terms }) => terms.some((term) => normalized.includes(term)))?.specialty ??
    null
  );
}

function detectZone(message: string): Condition["zone"] | null {
  const normalized = message.toLowerCase();
  if (/\b(hanche|aine|fesse)\b/.test(normalized)) return "Hanche";
  if (/\b(genou|rotule)\b/.test(normalized)) return "Genou";
  if (/\b(cheville|malléole|talon d'achille)\b/.test(normalized)) return "Cheville";
  if (/\b(pied|orteil|talon|plante|métatarse)\b/.test(normalized)) return "Pied";
  return null;
}

function scoreCondition(message: string, condition: Condition) {
  const normalized = message.toLowerCase();
  const phrases = [condition.name, condition.location, condition.feels, condition.triggers, condition.typicalSigns];
  return phrases.reduce((score, phrase) => {
    const words = phrase
      .toLowerCase()
      .split(/[^a-zàâçéèêëîïôûùüÿœ'-]+/)
      .filter((word) => word.length >= 5);
    return score + words.filter((word) => normalized.includes(word)).length;
  }, 0);
}

// Moteur déterministe : sert d'ANCRAGE (source de vérité) pour l'IA et de REPLI si l'IA échoue.
function buildCarePlan(message: string, selectedZone?: string): CarePlan {
  const normalized = message.toLowerCase();
  const urgent = detectRedFlag(message) !== null;
  const detectedZone = (
    ["Hanche", "Genou", "Cheville", "Pied"].includes(selectedZone ?? "") ? selectedZone : detectZone(message)
  ) as Condition["zone"] | null;
  const candidates = detectedZone ? conditions.filter((item) => item.zone === detectedZone) : [];
  const ranked = candidates
    .map((item) => ({ item, score: scoreCondition(message, item) }))
    .sort((a, b) => b.score - a.score);
  const condition =
    ranked[0] && ranked[0].score >= 3 && (ranked.length === 1 || ranked[0].score > (ranked[1]?.score ?? 0))
      ? ranked[0].item
      : null;
  const selected = condition ? pathways[condition.id] : undefined;
  const advice = condition ? conditionAdvice[condition.id] : undefined;
  const level: TriageLevel = urgent
    ? "urgent"
    : message.length > 80 || normalized.includes("depuis") || normalized.includes("semaine")
      ? "professional"
      : "self-care";
  const zoneFallback =
    detectedZone === "Pied"
      ? "Médecin généraliste ou podologue"
      : detectedZone === "Cheville"
        ? "Médecin généraliste ou kinésithérapeute"
        : detectedZone === "Genou"
          ? "Médecin généraliste ou kinésithérapeute"
          : detectedZone === "Hanche"
            ? "Médecin généraliste"
            : "Médecin généraliste";
  const actors = selected?.actors.filter((actor) => actor.line <= (level === "urgent" ? 1 : 2)) ?? [];
  const firstActor = actors[0];
  const careProfessional = condition?.whoToSee ?? zoneFallback;
  const firstStep = condition?.firstStep ?? "Décrivez précisément la douleur et surveillez son évolution.";
  const adaptiveNextStep = firstActor ? `${firstActor.role} : ${firstActor.mission}` : `${careProfessional}. ${firstStep}`;
  return {
    level,
    title: level === "urgent" ? "Avis médical urgent" : detectedZone ? `Première orientation pour une douleur de ${detectedZone.toLowerCase()}` : "Première orientation à préciser",
    summary: level === "urgent" ? "Votre description contient un élément qui justifie de ne pas attendre." : condition ? `Votre description peut correspondre à plusieurs situations, dont ${condition.name}. Seul un professionnel pourra confirmer la cause.` : "Plusieurs causes sont possibles. Un professionnel pourra examiner votre situation.",
    condition: condition ? condition.name : detectedZone ? `Douleur ${detectedZone === "Hanche" ? "de la hanche" : detectedZone === "Cheville" ? "de la cheville" : detectedZone === "Pied" ? "du pied" : "du genou"}` : "Douleur du membre inférieur non identifiée",
    nextStep: level === "urgent" ? "Appelez le 15 ou le 112, ou rendez-vous aux urgences selon l'intensité et votre état." : adaptiveNextStep,
    timeline: level === "urgent" ? "Aujourd'hui" : condition?.delay ?? firstActor?.delay ?? "Dans les prochains jours si la douleur persiste",
    stages: selected?.actors.slice(0, 3).map((actor) => ({ label: lineLabels[actor.line].label, title: actor.role, detail: `${actor.trigger} Délai indicatif : ${actor.delay}.` })) ?? [{ label: "Première étape", title: careProfessional, detail: firstStep }],
    escalation: selected?.escalation.slice(0, 3) ?? generalRedFlags.slice(0, 3),
    resources: advice?.tips.slice(0, 3).map((tip) => tip.title) ?? ["Parcours guidé", "Conseils validés", "Annuaire des professionnels"],
  };
}

// Sérialise le parcours curé en contexte factuel pour ancrer la génération.
function grounding(plan: CarePlan) {
  return [
    `Zone concernée : ${plan.condition}.`,
    `Repères de parcours Kivoir : ${plan.stages.map((s) => `${s.label} — ${s.title} (${s.detail})`).join(" | ")}.`,
    `Signes qui doivent alerter : ${plan.escalation.join(" ; ")}.`,
    `Ressources Kivoir utiles : ${plan.resources.join(", ")}.`,
  ].join("\n");
}

function conversationalResponse(...paragraphs: string[]) {
  return [...paragraphs, DISCLAIMER].filter(Boolean).join("\n\n");
}

function findVideoRecommendations(message: string, cabinetId?: string): ResourceLink[] {
  const normalized = normalize(message);
  const asksForInformation = ["video", "information", "comprendre", "conseil", "expliquer", "exercice", "trouble"].some((term) => normalized.includes(term));
  if (!asksForInformation) return [];

  const conditionTerms: Record<string, string[]> = {
    "entorse-cheville": ["entorse", "cheville"],
    "arthrose-genou": ["arthrose", "genou"],
    "aponevrosite-plantaire": ["aponevrosite", "fasciite", "talon"],
    "syndrome-rotulien": ["rotulien", "rotule"],
    "tendinopathie-achille": ["achille", "tendon"],
    "lesion-meniscale": ["menisque"],
    "arthrose-hanche": ["arthrose", "hanche"],
    metatarsalgie: ["metatarsalgie"],
    "syndrome-essuie-glace": ["essuie glace", "bandelette"],
    "hallux-valgus": ["hallux", "oignon"],
  };
  const matchedCondition = Object.entries(conditionTerms).find(([, terms]) => terms.some((term) => normalized.includes(term)))?.[0];
  const configured = cabinetId ? getDoctorVideos(cabinetId, matchedCondition) : [];
  if (configured.length > 0) return configured.slice(0, 2);

  const candidates = Object.entries(conditionResources)
    .filter(([key]) => (conditionTerms[key] ?? []).some((term) => normalized.includes(term)))
    .flatMap(([, resources]) => resources.links);
  const videos = candidates.length > 0 ? candidates : generalLinks;
  return videos.filter((resource) => resource.kind === "video").slice(0, 2);
}

// Réponse de repli naturelle lorsque la génération IA n'est pas disponible.
function fallbackText(plan: CarePlan) {
  return conversationalResponse(
    `${plan.summary} Continuez à suivre les consignes données lors de votre consultation et notez simplement l'évolution de ce que vous ressentez.`,
    `${plan.nextStep} Ce repère reste indicatif : ${plan.timeline.toLocaleLowerCase("fr-FR")}.`,
    `Le professionnel à privilégier est celui indiqué dans votre prochaine étape. Je vous invite à consulter l'annuaire du réseau de soins pour trouver ce praticien près de chez vous.`,
  );
}

// Nettoie les éventuels en-têtes produits par le modèle et garantit la clôture de sécurité.
function ensureConversationalResponse(text: string, plan: CarePlan) {
  const clean = text
    .replace(DISCLAIMER, "")
    .replace(/^\s*(?:#{1,6}\s*)?(?:\*\*)?(?:Rassurer\s*&\s*Conseiller|Détecter le besoin|Orienter)(?:\*\*)?\s*:?[ \t]*$/gim, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return conversationalResponse(
    clean || plan.summary,
    "Je vous invite à consulter l'annuaire du réseau de soins pour trouver le professionnel adapté près de chez vous.",
  );
}

function directoryResponse(specialty: PractitionerSpecialty) {
  const label = specialty.toLocaleLowerCase("fr-FR");
  return conversationalResponse(
    "Votre demande d'orientation est légitime : prendre le temps d'identifier le bon interlocuteur aide à organiser la suite de votre suivi.",
    `Le profil adapté ici est celui d'un ${label}.`,
    "Pour afficher le réseau de soins concerné, ouvrez l'annuaire et saisissez le nom de votre médecin : les professionnels de son cabinet, dont ce spécialiste, apparaîtront alors.",
  );
}

export const askCareAgent = createServerFn({ method: "POST" })
  .validator((data: unknown) => requestSchema.parse(data))
  .handler(async ({ data }) => {
    // 1) Protection de l'anonymat AVANT tout appel au modèle.
    const identifyingData = detectIdentifyingData(data.message);
    if (identifyingData) {
      return { text: privacyResponse(identifyingData), blocked: true, emergency: false, specialty: null, videos: [] };
    }

    // 2) Filtre de sécurité déterministe AVANT tout appel au modèle.
    const redFlag = detectRedFlag(data.message);
    if (redFlag) {
      return { text: emergencyResponse(redFlag), emergency: true, specialty: null, videos: [] };
    }

    // 3) L'historique récent reste borné, éphémère et n'est jamais persisté.
    const safeHistory = data.history.slice(-8);
    const userContext = safeHistory
      .filter((item) => item.role === "user")
      .map((item) => item.text)
      .concat(data.message)
      .join("\n");
    const plan = buildCarePlan(userContext, data.zone);
    const conversation = safeHistory
      .map((item) => `${item.role === "user" ? "Patient" : "Assistant"} : ${item.text}`)
      .concat(`Patient : ${data.message}`)
      .join("\n\n");

    // 4) Le modèle peut clarifier le besoin ou appeler l'annuaire puis orienter.
    try {
      const result = await generateText({
        model: MODEL,
        system: SYSTEM_PROMPT,
        prompt: `Contexte Kivoir (source de vérité, ne pas contredire) :\n${grounding(plan)}\n\nConversation récente, fournie uniquement pour ce tour :\n"""${conversation}"""\n\nRépondez au dernier message sans redemander une information déjà donnée. Si une information essentielle manque pour orienter sans supposer, posez une seule question ouverte et utile. Sinon, donnez des conseils prudents puis terminez par une orientation naturelle vers le profil professionnel adapté et l'annuaire du réseau de soins. N'utilisez ni titre, ni liste, ni diagnostic inféré.`,
        tools: { rechercherPraticiensSaintMaur },
        toolChoice: "auto",
        stopWhen: isStepCount(3),
        temperature: 0.3,
        maxOutputTokens: 500,
      });

      const directoryResult = [...result.toolResults]
        .reverse()
        .find((toolResult) => toolResult.toolName === "rechercherPraticiensSaintMaur");
      const output = directoryResult?.output as { specialite: PractitionerSpecialty } | undefined;
      const specialty = output?.specialite ?? detectSpecialty(userContext);

      return {
        text: specialty ? directoryResponse(specialty) : ensureConversationalResponse(result.text, plan),
        emergency: false,
        specialty,
        videos: findVideoRecommendations(userContext, data.cabinetId),
      };
    } catch {
      const specialty = detectSpecialty(userContext);
      return {
        text: specialty ? directoryResponse(specialty) : fallbackText(plan),
        emergency: false,
        specialty,
      };
    }
  });
