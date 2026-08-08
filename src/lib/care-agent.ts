import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { z } from "zod";
import { conditions, levelCopy, triageQuestions, type TriageLevel } from "@/lib/conditions";
import { pathways, lineLabels } from "@/lib/pathways";
import { conditionAdvice, generalRedFlags } from "@/lib/condition-advice";

const requestSchema = z.object({
  message: z.string().trim().min(3).max(800),
  zone: z.string().optional(),
});

const scope = conditions.map((condition) => `${condition.name} (${condition.zone})`).join(", ");
const triage = triageQuestions.map((question) => question.question).join(" | ");

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
    try {
      const { text } = await generateText({
      model: gateway("openai/gpt-oss-20b"),
      system: `Tu es l'assistant Kivoir pour orienter les patients ayant une douleur d'un membre inférieur. Tu ne poses jamais de diagnostic et tu ne prescris aucun traitement. Tu réponds en français simple, avec empathie et brièvement. Tu dois d'abord rechercher les signes d'urgence : incapacité totale à prendre appui, déformation, douleur thoracique ou essoufflement, mollet brutalement gonflé et douloureux, fièvre importante avec articulation rouge et chaude, perte de sensibilité ou faiblesse brutale. En cas de doute ou de signe d'alerte, recommande les urgences ou le 15/112. Tu ne parles que de ces 10 pathologies déjà documentées : ${scope}. Si tu identifies une situation, renvoie uniquement un objet JSON valide avec les clés title, summary, condition, nextStep, timeline, stages (tableau d'objets label/title/detail), escalation (tableau de chaînes), resources (tableau de chaînes) et level (urgent, professional ou self-care). Le champ nextStep doit dire qui consulter et dans quel ordre ; stages doit décrire le parcours de soin étape par étape. Si tu n'es pas certain, utilise la première ligne et demande une consultation médicale. Les questions de triage validées sont : ${triage}. Oriente vers médecin généraliste, kinésithérapeute, podologue, rhumatologue ou orthopédiste selon le parcours, sans présenter l'orientation comme une certitude. Termine par une question utile ou une prochaine étape. Ne demande jamais de nom, adresse ou autre donnée identifiante.`,
      prompt: `Zone éventuellement sélectionnée : ${data.zone ?? "non précisée"}\nMessage du patient : ${data.message}`,
    });

      return { text: text || localCareGuidance(data.message) };
    } catch (error) {
      console.error("[v0] Care agent Gateway error", error);
      return { text: localCareGuidance(data.message) };
    }
  });
