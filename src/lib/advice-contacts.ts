import { conditions } from "@/lib/conditions";

export type AdviceContact = { id: string; who: string; when: string };

export function adviceContactsFor(pathwayId: string | undefined): AdviceContact[] {
  const whoToSee = conditions.find((item) => item.id === pathwayId)?.whoToSee.toLowerCase() ?? "";
  const careProviders = [
    whoToSee.includes("kinésithérapeute") ? "kinésithérapeute" : null,
    whoToSee.includes("podologue") ? "podologue" : null,
  ].filter((item): item is string => Boolean(item));

  const careLabel = careProviders.length
    ? careProviders.map((item, index) => (index === 0 ? item.charAt(0).toUpperCase() + item.slice(1) : item)).join(" ou ")
    : "Professionnel indiqué";

  return [
    { id: "medecin", who: "Médecin", when: "Si votre situation ne s’améliore pas, s’aggrave ou si vous avez un doute." },
    { id: "soin", who: careLabel, when: "Si une prise en charge vous a été prescrite ou conseillée." },
    { id: "pharmacien", who: "Pharmacien", when: "Pour vous aider à comprendre ou utiliser un traitement déjà conseillé ou prescrit." },
  ];
}
