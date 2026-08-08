import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { conditions, type TriageLevel } from "@/lib/conditions";
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

function buildCarePlan(message: string): CarePlan {
  const normalized = message.toLowerCase();
  const urgent = [...generalRedFlags, "ne peux pas poser", "impossible de poser", "déformation", "essoufflement", "douleur thoracique", "faiblesse brutale"].some((signal) => normalized.includes(signal.toLowerCase()));
  const condition = conditions.find((item) => [item.name, item.zone, item.location, item.triggers].some((value) => normalized.includes(value.toLowerCase().split(" ")[0]))) ?? conditions.find((item) => normalized.includes(item.zone.toLowerCase()));
  const selected = condition ? pathways[condition.id] : undefined;
  const advice = condition ? conditionAdvice[condition.id] : undefined;
  const level: TriageLevel = urgent ? "urgent" : message.length > 80 || normalized.includes("depuis") || normalized.includes("semaine") ? "professional" : "self-care";
  const actors = selected?.actors.filter((actor) => actor.line <= (level === "urgent" ? 1 : 2)) ?? [];
  const firstActor = actors[0];
  return {
    level,
    title: level === "urgent" ? "Avis médical urgent" : level === "professional" ? "Consultation à organiser" : "Surveillance et premiers soins",
    summary: level === "urgent" ? "Votre description contient un élément qui justifie de ne pas attendre." : "Ce résultat propose une prochaine étape, sans poser de diagnostic.",
    condition: condition?.name ?? "Douleur du membre inférieur non identifiée",
    nextStep: level === "urgent" ? "Appelez le 15 ou le 112, ou rendez-vous aux urgences selon l'intensité et votre état." : firstActor ? `${firstActor.role} : ${firstActor.mission}` : "Prenez rendez-vous avec votre médecin généraliste pour une première évaluation.",
    timeline: level === "urgent" ? "Aujourd'hui" : firstActor?.delay ?? "Dans les prochains jours si la douleur persiste",
    stages: selected?.actors.slice(0, 3).map((actor) => ({ label: lineLabels[actor.line].label, title: actor.role, detail: `${actor.trigger} Délai indicatif : ${actor.delay}.` })) ?? [{ label: "1re ligne", title: "Médecin généraliste", detail: "Évalue la situation et vous oriente vers le professionnel adapté." }],
    escalation: selected?.escalation.slice(0, 3) ?? generalRedFlags.slice(0, 3),
    resources: advice?.tips.slice(0, 3).map((tip) => tip.title) ?? ["Parcours guidé", "Conseils validés", "Annuaire des professionnels"],
  };
}

function formatCarePlan(plan: CarePlan) {
  return JSON.stringify(plan);
}

function localCareGuidance(message: string) {
  return formatCarePlan(buildCarePlan(message));
}

export const askCareAgent = createServerFn({ method: "POST" })
  .validator((data: unknown) => requestSchema.parse(data))
  .handler(async ({ data }) => {
    // Le parcours validé localement est la source de vérité : l'IA ne doit jamais
    // pouvoir remplacer une zone ou une orientation par une hypothèse.
    return { text: localCareGuidance(data.message) };
  });
