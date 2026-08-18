import { createServerFn } from "@tanstack/react-start";
import { generateText, isStepCount, tool } from "ai";
import { z } from "zod";
import { conditions, type Condition, type TriageLevel } from "@/lib/conditions";
import { pathways, lineLabels } from "@/lib/pathways";
import { conditionAdvice, generalRedFlags } from "@/lib/condition-advice";
import localPractitioners from "../../data/praticiens_saint_maur.json";

// Modèle servi via l'AI Gateway de Vercel (string "provider/model").
const MODEL = "openai/gpt-4.1-mini";

// Phrase de clôture imposée à CHAQUE réponse de l'agent.
const DISCLAIMER =
  "⚠️ Kivoir est un outil d'accompagnement au parcours de soin et ne remplace pas une consultation médicale.";

// System Prompt de « Assistant Kivoir » : rôle, périmètre, règles strictes et style.
const SYSTEM_PROMPT = `Tu es l'Assistant Kivoir, un agent d'orientation spécialisé dans l'appareil locomoteur du membre inférieur : hanche, genou, cheville et pied. Tu es factuel, rassurant, pédagogue et rigoureux.

RÈGLES CLINIQUES ABSOLUES :
- Il t'est formellement interdit de poser ou de suggérer un diagnostic médical formel.
- N'interprète jamais une imagerie ou un résultat d'examen et ne prescris jamais de médicament, posologie ou traitement.
- Une déformation visible, une impossibilité totale de prendre appui ou une douleur explicitement évaluée à 10/10 impose une orientation immédiate vers le 15/112 ou les urgences.
- En dehors de ces urgences critiques, recommande une consultation médicale sous 24 à 48 heures lorsque la situation nécessite un examen, avec des conseils d'attente sobres et prudents.
- Reste dans le périmètre du membre inférieur. Pour une autre zone, explique cette limite et invite à consulter.
- Le « Contexte Kivoir » fourni est ta source de vérité : ne l'invente pas et ne le contredis pas.

ANNUAIRE :
- Dès qu'une personne cherche un professionnel à Saint-Maur-des-Fossés, directement ou dans une question naturelle, appelle l'outil rechercherPraticiensSaintMaur.
- Utilise uniquement l'une des cinq spécialités acceptées par l'outil.
- Après l'appel, présente brièvement l'orientation sans recopier toutes les coordonnées : les cartes sont affichées séparément dans l'interface.
- Si l'outil ne trouve personne, dis-le clairement sans inventer de nom, d'adresse ou de téléphone.

STYLE :
- Vouvoiement systématique, ton bienveillant, clair et mesuré, sans jargon inutile.
- Réponse concise, structurée en paragraphes courts.

FIN DE RÉPONSE (obligatoire) :
Termine toujours, sur une nouvelle ligne, par exactement :
${DISCLAIMER}`;

const requestSchema = z.object({
  message: z.string().trim().min(3).max(800),
  zone: z.string().optional(),
});

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
    `🚨 Ce que vous décrivez (${reason}) peut être un signe qui nécessite un avis médical immédiat.`,
    `N'attendez pas : appelez le 15 (SAMU) ou le 112, ou rendez-vous au service d'urgences le plus proche.`,
    `Si votre état s'aggrave (douleur intense, malaise, essoufflement), rappelez le 15 sans tarder.`,
    "",
    DISCLAIMER,
  ].join("\n");
}

type LocalPractitioner = {
  nom: string;
  prenom: string;
  specialite: string;
  adresse: string;
  telephone: string;
  codePostal: string;
  ville: string;
  secteur: string;
};

type CabinetDirectory = Record<
  string,
  {
    nom_cabinet: string;
    praticiens: Array<{ nom: string; specialite: string; adresse: string; telephone: string }>;
  }
>;

const directoryPractitioners: LocalPractitioner[] = Object.values(
  localPractitioners as CabinetDirectory,
).flatMap((cabinet) =>
  cabinet.praticiens.map((practitioner) => {
    const addressMatch = practitioner.adresse.match(/^(.*?),\s*(\d{5})\s+(.+)$/);
    return {
      nom: practitioner.nom,
      prenom: "",
      specialite: practitioner.specialite,
      adresse: addressMatch?.[1]?.trim() ?? practitioner.adresse,
      telephone: practitioner.telephone.replace(/\D/g, ""),
      codePostal: addressMatch?.[2] ?? "",
      ville: addressMatch?.[3]?.trim() ?? "Saint-Maur-des-Fossés",
      secteur: "",
    };
  }),
);

const practitionerSpecialtySchema = z.enum([
  "médecin généraliste",
  "médecin du sport",
  "kinésithérapeute",
  "podologue",
  "chirurgien orthopédiste",
]);

type PractitionerSpecialty = z.infer<typeof practitionerSpecialtySchema>;

const directorySpecialtyLabels: Record<PractitionerSpecialty, string> = {
  "médecin généraliste": "Médecin généraliste",
  "médecin du sport": "Médecin du sport",
  kinésithérapeute: "Kinésithérapeute",
  podologue: "Podologue",
  "chirurgien orthopédiste": "Chirurgien orthopédiste",
};

function searchLocalPractitioners(specialty: PractitionerSpecialty): LocalPractitioner[] {
  const target = normalize(directorySpecialtyLabels[specialty]);
  return directoryPractitioners.filter(
    (practitioner) => normalize(practitioner.specialite) === target,
  );
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
  { specialty: "médecin du sport", terms: ["medecin du sport", "sport"] },
  { specialty: "chirurgien orthopédiste", terms: ["orthopediste", "chirurgien", "traumatologue"] },
  { specialty: "kinésithérapeute", terms: ["kine", "kinesitherapeute", "physio"] },
  { specialty: "podologue", terms: ["podologue", "pedicure", "semelle"] },
  { specialty: "médecin généraliste", terms: ["medecin generaliste", "generaliste", "medecin traitant"] },
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

// Réponse de repli (sans IA), toujours terminée par le disclaimer.
function fallbackText(plan: CarePlan) {
  return [plan.summary, "", `Prochaine étape : ${plan.nextStep}`, `Délai indicatif : ${plan.timeline}.`, "", DISCLAIMER]
    .filter(Boolean)
    .join("\n");
}

// Garantit la présence du disclaimer même si le modèle l'oublie.
function ensureDisclaimer(text: string) {
  const clean = text.trim();
  return clean.includes("ne remplace pas une consultation") ? clean : `${clean}\n\n${DISCLAIMER}`;
}

function directoryResponse(specialty: PractitionerSpecialty, count: number) {
  const label = directorySpecialtyLabels[specialty].toLocaleLowerCase("fr-FR");
  return ensureDisclaimer(
    `${count} ${count > 1 ? "professionnels correspondent" : "professionnel correspond"} à votre recherche de ${label} à Saint-Maur-des-Fossés. Leurs coordonnées sont affichées ci-dessous.`,
  );
}

export const askCareAgent = createServerFn({ method: "POST" })
  .validator((data: unknown) => requestSchema.parse(data))
  .handler(async ({ data }) => {
    // 1) Filtre de sécurité déterministe AVANT tout appel au modèle.
    const redFlag = detectRedFlag(data.message);
    if (redFlag) {
      return { text: emergencyResponse(redFlag), emergency: true, specialty: null, practitioners: [] };
    }

    // 2) Ancrage : le parcours curé de Kivoir reste la source de vérité.
    const plan = buildCarePlan(data.message, data.zone);

    // 3) Le modèle peut appeler l'annuaire puis formuler une réponse cohérente.
    try {
      const result = await generateText({
        model: MODEL,
        system: SYSTEM_PROMPT,
        prompt: `Contexte Kivoir (source de vérité, ne pas contredire) :\n${grounding(plan)}\n\nMessage de la personne :\n"""${data.message}"""`,
        tools: { rechercherPraticiensSaintMaur },
        toolChoice: "auto",
        stopWhen: isStepCount(3),
        temperature: 0.3,
        maxOutputTokens: 500,
      });

      const directoryResult = [...result.toolResults]
        .reverse()
        .find((toolResult) => toolResult.toolName === "rechercherPraticiensSaintMaur");
      const output = directoryResult?.output as
        | { specialite: PractitionerSpecialty; praticiens: LocalPractitioner[] }
        | undefined;
      const specialty = output?.specialite ?? null;
      const practitioners = output?.praticiens ?? [];

      return {
        text:
          specialty && practitioners.length > 0
            ? directoryResponse(specialty, practitioners.length)
            : ensureDisclaimer(result.text),
        emergency: false,
        specialty,
        practitioners,
      };
    } catch (error) {
      console.log("[v0] Assistant Kivoir — repli déterministe (échec IA) :", error instanceof Error ? error.message : error);
      const specialty = detectSpecialty(data.message);
      const practitioners = specialty ? searchLocalPractitioners(specialty) : [];
      return {
        text:
          specialty && practitioners.length > 0
            ? directoryResponse(specialty, practitioners.length)
            : fallbackText(plan),
        emergency: false,
        specialty,
        practitioners,
      };
    }
  });
