import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { conditions, type Condition, type TriageLevel } from "@/lib/conditions";
import { pathways, lineLabels } from "@/lib/pathways";
import { conditionAdvice, generalRedFlags } from "@/lib/condition-advice";

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
    const words = phrase.toLowerCase().split(/[^a-zàâçéèêëîïôûùüÿœ'-]+/).filter((word) => word.length >= 5);
    return score + words.filter((word) => normalized.includes(word)).length;
  }, 0);
}

function buildCarePlan(message: string, selectedZone?: string): CarePlan {
  const normalized = message.toLowerCase();
  const urgent = [...generalRedFlags, "ne peux pas poser", "impossible de poser", "déformation", "essoufflement", "douleur thoracique", "faiblesse brutale"].some((signal) => normalized.includes(signal.toLowerCase()));
  const detectedZone = (["Hanche", "Genou", "Cheville", "Pied"].includes(selectedZone ?? "") ? selectedZone : detectZone(message)) as Condition["zone"] | null;
  const candidates = detectedZone ? conditions.filter((item) => item.zone === detectedZone) : [];
  const ranked = candidates.map((item) => ({ item, score: scoreCondition(message, item) })).sort((a, b) => b.score - a.score);
  const condition = ranked[0] && (ranked[0].score >= 2 || candidates.length === 1) ? ranked[0].item : null;
  const selected = condition ? pathways[condition.id] : undefined;
  const advice = condition ? conditionAdvice[condition.id] : undefined;
  const level: TriageLevel = urgent ? "urgent" : message.length > 80 || normalized.includes("depuis") || normalized.includes("semaine") ? "professional" : "self-care";
  const zoneFallback = detectedZone === "Pied" ? "Médecin généraliste ou podologue" : detectedZone === "Cheville" ? "Médecin généraliste ou kinésithérapeute" : detectedZone === "Genou" ? "Médecin généraliste ou kinésithérapeute" : detectedZone === "Hanche" ? "Médecin généraliste" : "Médecin généraliste";
  const actors = selected?.actors.filter((actor) => actor.line <= (level === "urgent" ? 1 : 2)) ?? [];
  const firstActor = actors[0];
  const careProfessional = condition?.whoToSee ?? zoneFallback;
  const firstStep = condition?.firstStep ?? "Décrivez précisément la douleur et surveillez son évolution.";
  const adaptiveNextStep = firstActor ? `${firstActor.role} : ${firstActor.mission}` : `${careProfessional}. ${firstStep}`;
  return {
    level,
    title: level === "urgent" ? "Avis médical urgent" : condition ? `Orientation pour ${condition.name}` : detectedZone ? `Orientation pour la zone : ${detectedZone.toLowerCase()}` : "Orientation à préciser",
    summary: level === "urgent" ? "Votre description contient un élément qui justifie de ne pas attendre." : condition ? `${condition.summary} Cette orientation reste indicative et doit être confirmée par un professionnel.` : "Il manque des éléments pour proposer un professionnel précis.",
    condition: condition ? condition.name : detectedZone ? `Douleur ${detectedZone === "Hanche" ? "de la hanche" : detectedZone === "Cheville" ? "de la cheville" : detectedZone === "Pied" ? "du pied" : "du genou"}` : "Douleur du membre inférieur non identifiée",
    nextStep: level === "urgent" ? "Appelez le 15 ou le 112, ou rendez-vous aux urgences selon l'intensité et votre état." : adaptiveNextStep,
    timeline: level === "urgent" ? "Aujourd'hui" : condition?.delay ?? firstActor?.delay ?? "Dans les prochains jours si la douleur persiste",
    stages: selected?.actors.slice(0, 3).map((actor) => ({ label: lineLabels[actor.line].label, title: actor.role, detail: `${actor.trigger} Délai indicatif : ${actor.delay}.` })) ?? [{ label: "Première étape", title: careProfessional, detail: firstStep }],
    escalation: selected?.escalation.slice(0, 3) ?? generalRedFlags.slice(0, 3),
    resources: advice?.tips.slice(0, 3).map((tip) => tip.title) ?? ["Parcours guidé", "Conseils validés", "Annuaire des professionnels"],
  };
}

function formatCarePlan(plan: CarePlan) {
  return JSON.stringify(plan);
}

function localCareGuidance(message: string, zone?: string) {
  return formatCarePlan(buildCarePlan(message, zone));
}

export const askCareAgent = createServerFn({ method: "POST" })
  .validator((data: unknown) => requestSchema.parse(data))
  .handler(async ({ data }) => {
    // Le parcours validé localement est la source de vérité : l'IA ne doit jamais
    // pouvoir remplacer une zone ou une orientation par une hypothèse.
    return { text: localCareGuidance(data.message, data.zone) };
  });
