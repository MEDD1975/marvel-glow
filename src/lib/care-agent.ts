import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { conditions, triageQuestions } from "@/lib/conditions";

const requestSchema = z.object({
  message: z.string().trim().min(3).max(800),
  zone: z.string().optional(),
});

const scope = conditions.map((condition) => `${condition.name} (${condition.zone})`).join(", ");
const triage = triageQuestions.map((question) => question.question).join(" | ");

export const askCareAgent = createServerFn({ method: "POST" })
  .validator((data: unknown) => requestSchema.parse(data))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: "openai/gpt-oss-20b",
      system: `Tu es l'assistant Kivoir pour orienter les patients ayant une douleur d'un membre inférieur. Tu ne poses jamais de diagnostic et tu ne prescris aucun traitement. Tu réponds en français simple, avec empathie et brièvement. Tu dois d'abord rechercher les signes d'urgence : incapacité totale à prendre appui, déformation, douleur thoracique ou essoufflement, mollet brutalement gonflé et douloureux, fièvre importante avec articulation rouge et chaude, perte de sensibilité ou faiblesse brutale. En cas de doute ou de signe d'alerte, recommande les urgences ou le 15/112. Tu ne parles que de ces 10 pathologies déjà documentées : ${scope}. Les questions de triage validées sont : ${triage}. Oriente vers médecin généraliste, kinésithérapeute, podologue, rhumatologue ou orthopédiste selon le parcours, sans présenter l'orientation comme une certitude. Termine par une question utile ou une prochaine étape. Ne demande jamais de nom, adresse ou autre donnée identifiante.`,
      prompt: `Zone éventuellement sélectionnée : ${data.zone ?? "non précisée"}\nMessage du patient : ${data.message}`,
    });

    return { text };
  });
