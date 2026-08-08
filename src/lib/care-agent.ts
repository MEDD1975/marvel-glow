import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { z } from "zod";
import { conditions, triageQuestions } from "@/lib/conditions";

const requestSchema = z.object({
  message: z.string().trim().min(3).max(800),
  zone: z.string().optional(),
});

const scope = conditions.map((condition) => `${condition.name} (${condition.zone})`).join(", ");
const triage = triageQuestions.map((question) => question.question).join(" | ");

function localCareGuidance(message: string) {
  const normalized = message.toLowerCase();
  const urgent = ["ne peux pas poser", "impossible de poser", "déformation", "déformé", "essoufflement", "douleur thoracique", "mollet gonflé", "fièvre", "perte de sensibilité", "faiblesse brutale"].some((signal) => normalized.includes(signal));

  if (urgent) {
    return "Votre description contient un signe qui mérite une évaluation médicale rapide. Appelez le 15 ou le 112 si la situation est importante, ou rendez-vous aux urgences. Ne conduisez pas vous-même si vous êtes très mal. Cette réponse ne constitue pas un diagnostic.";
  }

  const professional = normalized.includes("pied") || normalized.includes("cheville") ? "médecin généraliste, puis éventuellement un kinésithérapeute ou un podologue" : normalized.includes("genou") || normalized.includes("hanche") ? "médecin généraliste, puis éventuellement un kinésithérapeute, un rhumatologue ou un orthopédiste" : "médecin généraliste, qui pourra vous orienter vers le professionnel adapté";
  return `Je ne peux pas confirmer la cause de votre douleur. Pour commencer, notez sa localisation, sa durée, son intensité et ce qui l'aggrave. Au vu de votre message, la prochaine étape la plus prudente est de consulter un ${professional}. Si la douleur s'aggrave, devient intense ou s'accompagne d'un signe inhabituel, demandez un avis rapidement. Cette réponse ne constitue pas un diagnostic.`;
}

export const askCareAgent = createServerFn({ method: "POST" })
  .validator((data: unknown) => requestSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const { text } = await generateText({
      model: gateway("openai/gpt-oss-20b"),
      system: `Tu es l'assistant Kivoir pour orienter les patients ayant une douleur d'un membre inférieur. Tu ne poses jamais de diagnostic et tu ne prescris aucun traitement. Tu réponds en français simple, avec empathie et brièvement. Tu dois d'abord rechercher les signes d'urgence : incapacité totale à prendre appui, déformation, douleur thoracique ou essoufflement, mollet brutalement gonflé et douloureux, fièvre importante avec articulation rouge et chaude, perte de sensibilité ou faiblesse brutale. En cas de doute ou de signe d'alerte, recommande les urgences ou le 15/112. Tu ne parles que de ces 10 pathologies déjà documentées : ${scope}. Les questions de triage validées sont : ${triage}. Oriente vers médecin généraliste, kinésithérapeute, podologue, rhumatologue ou orthopédiste selon le parcours, sans présenter l'orientation comme une certitude. Termine par une question utile ou une prochaine étape. Ne demande jamais de nom, adresse ou autre donnée identifiante.`,
      prompt: `Zone éventuellement sélectionnée : ${data.zone ?? "non précisée"}\nMessage du patient : ${data.message}`,
    });

      return { text };
    } catch (error) {
      console.error("[v0] Care agent Gateway error", error);
      return { text: localCareGuidance(data.message) };
    }
  });
