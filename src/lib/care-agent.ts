import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { conditions, type Condition, type TriageLevel } from "@/lib/conditions";
import { pathways, lineLabels } from "@/lib/pathways";
import { conditionAdvice, generalRedFlags } from "@/lib/condition-advice";

// Modèle servi via l'AI Gateway de Vercel (string "provider/model").
const MODEL = "openai/gpt-4.1-mini";

// Phrase de clôture imposée à CHAQUE réponse de l'agent.
const DISCLAIMER =
  "⚠️ Kivoir est un outil d'accompagnement au parcours de soin et ne remplace pas une consultation médicale.";

// System Prompt de « Navire » : rôle, périmètre, règles strictes et style.
const SYSTEM_PROMPT = `Tu es « Navire », l'assistant d'orientation de Kivoir. Tu es spécialisé dans l'orientation et la pédagogie autour des douleurs du MEMBRE INFÉRIEUR uniquement : hanche, genou, cheville et pied.

Ta mission : aider la personne à comprendre sa situation et à savoir vers quel professionnel se tourner, avec bienveillance. Tu ne remplaces jamais un médecin.

RÈGLES ABSOLUES :
- Ne pose JAMAIS de diagnostic médical et n'affirme jamais de quelle pathologie il s'agit.
- N'interprète JAMAIS d'imagerie (radio, IRM, échographie, scanner) ni aucun résultat d'examen.
- Ne donne JAMAIS de prescription, de médicament, de posologie ni de traitement médical.
- Reste STRICTEMENT sur le membre inférieur. Si la question porte sur une autre partie du corps ou est hors sujet, explique gentiment que tu n'accompagnes que les douleurs de hanche, genou, cheville et pied, et invite à consulter.
- Appuie-toi sur le « Contexte Kivoir » fourni comme source de vérité pour l'orientation : ne l'invente pas et ne le contredis pas.

STYLE :
- Ton empathique, rassurant, clair et concret.
- Très court : 3 à 4 phrases maximum par paragraphe.
- Vouvoiement systématique. Pas de jargon inutile.

FIN DE RÉPONSE (obligatoire) :
Termine TOUJOURS ta réponse, sur une nouvelle ligne, par exactement :
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
  const t = normalize(message);
  const has = (...words: string[]) => words.some((w) => t.includes(normalize(w)));

  // Impossibilité totale d'appui.
  if (
    /(impossible|incapable|je ne peux plus|je ne peux pas|peux plus|n ?arrive plus|n ?arrive pas)[^.!?]{0,40}(appui|poser le pied|poser mon pied|marcher|tenir debout|me lever|m ?appuyer)/.test(
      t,
    ) ||
    has("aucun appui", "appui impossible", "ne tient pas debout", "ne tiens pas debout")
  ) {
    return "impossibilité de prendre appui sur la jambe";
  }

  // Mollet chaud / rouge / gonflé (signe évoquant une phlébite).
  if (
    /mollet[^.!?]{0,30}(chaud|rouge|gonfl|dur|tendu)/.test(t) ||
    /(chaud|rouge|gonfl|dur|tendu)[^.!?]{0,30}mollet/.test(t)
  ) {
    return "mollet chaud, rouge ou gonflé";
  }

  // Fièvre associée à une articulation rouge ou chaude.
  if (
    has("fievre", "39 de", "40 de", "temperature elevee") &&
    has("rouge", "chaud", "gonfl", "articulation", "genou", "cheville", "hanche")
  ) {
    return "fièvre associée à une articulation rouge ou chaude";
  }

  // Perte de sensibilité / pied tombant.
  if (
    has(
      "perte de sensibilite",
      "plus de sensibilite",
      "insensible",
      "je ne sens plus",
      "pied tombant",
      "paralysie",
      "paralyse",
    )
  ) {
    return "perte de sensibilité ou pied tombant";
  }

  // Déformation visible du membre.
  if (has("deformation", "deforme", "os qui sort", "os sort", "angle anormal", "fracture ouverte")) {
    return "déformation visible du membre";
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
  const urgent = [
    ...generalRedFlags,
    "ne peux pas poser",
    "impossible de poser",
    "déformation",
    "essoufflement",
    "douleur thoracique",
    "faiblesse brutale",
  ].some((signal) => normalized.includes(signal.toLowerCase()));
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

export const askCareAgent = createServerFn({ method: "POST" })
  .validator((data: unknown) => requestSchema.parse(data))
  .handler(async ({ data }) => {
    // 1) Filtre de sécurité déterministe AVANT tout appel au modèle.
    const redFlag = detectRedFlag(data.message);
    if (redFlag) {
      return { text: emergencyResponse(redFlag), emergency: true };
    }

    // 2) Ancrage : le parcours curé de Kivoir reste la source de vérité.
    const plan = buildCarePlan(data.message, data.zone);
    if (plan.level === "urgent") {
      return { text: emergencyResponse("un signe d'alerte détecté dans votre description"), emergency: true };
    }

    // 3) Génération encadrée par le System Prompt de « Navire ».
    try {
      const { text } = await generateText({
        model: MODEL,
        system: SYSTEM_PROMPT,
        prompt: `Contexte Kivoir (source de vérité, ne pas contredire) :\n${grounding(plan)}\n\nMessage de la personne :\n"""${data.message}"""`,
        temperature: 0.4,
        maxOutputTokens: 500,
      });
      return { text: ensureDisclaimer(text), emergency: false };
    } catch (error) {
      console.log("[v0] Navire — repli déterministe (échec IA) :", error instanceof Error ? error.message : error);
      return { text: fallbackText(plan), emergency: false };
    }
  });
