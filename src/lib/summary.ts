import { triageQuestions, type Condition, type TriageOption } from "@/lib/conditions";

/**
 * Texte de synthèse destiné au médecin, à coller dans le dossier patient.
 * Aucune donnée n'est enregistrée : le texte est généré à la volée dans le navigateur.
 * Strictement déclaratif : aucun niveau de triage ni orientation n'est suggéré.
 */
export function buildDoctorSummary(condition: Condition, answers: TriageOption[]) {
  const lines: string[] = [];
  lines.push(`Questionnaire Kivoir — pré-consultation (déclaratif patient)`);
  lines.push(`Zone décrite par le patient : ${condition.zone}`);
  lines.push(`Localisation : ${condition.location}`);
  lines.push("");
  lines.push("Réponses du patient :");
  answers.forEach((answer, i) => {
    const question = triageQuestions[i]?.question ?? `Question ${i + 1}`;
    lines.push(`- ${question} → ${answer.label}`);
  });
  lines.push("");
  lines.push(
    "Recueil déclaratif du patient. Ne constitue ni un diagnostic, ni une orientation, ni une aide à la décision médicale.",
  );
  return lines.join("\n");
}
