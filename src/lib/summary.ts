import { triageQuestions, type Condition, type TriageLevel, type TriageOption } from "@/lib/conditions";

const levelWording: Record<TriageLevel, string> = {
  urgent: "Situation à évaluer sans délai",
  professional: "Consultation médicale recommandée",
  "self-care": "Auto-soin surveillé",
};

/**
 * Texte de synthèse destiné au médecin, à coller dans le dossier patient.
 * Aucune donnée n'est enregistrée : le texte est généré à la volée dans le navigateur.
 */
export function buildDoctorSummary(condition: Condition, answers: TriageOption[], level: TriageLevel) {
  const lines: string[] = [];
  lines.push(`Questionnaire Kivoir — pré-consultation (déclaratif patient)`);
  lines.push(`Trouble évoqué par le patient : ${condition.name} (${condition.zone})`);
  lines.push(`Localisation décrite : ${condition.location}`);
  lines.push("");
  lines.push("Réponses du patient :");
  answers.forEach((answer, i) => {
    const question = triageQuestions[i]?.question ?? `Question ${i + 1}`;
    lines.push(`- ${question} → ${answer.label}`);
  });
  lines.push("");
  lines.push(`Niveau d'orientation suggéré : ${levelWording[level]}`);
  lines.push(`Repère du parcours gradué : ${condition.whoToSee}`);
  lines.push(`Délai habituel : ${condition.delay}`);
  lines.push("");
  lines.push(
    "Outil d'information et d'aide au recueil déclaratif. Ne constitue ni un diagnostic, ni une aide à la décision médicale.",
  );
  return lines.join("\n");
}
