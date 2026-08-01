import { useState } from "react";
import { ClipboardCheck, Copy, ShieldCheck } from "lucide-react";
import { buildDoctorSummary } from "@/lib/summary";
import type { Condition, TriageLevel, TriageOption } from "@/lib/conditions";

/**
 * Synthèse de pré-consultation à montrer ou coller au médecin.
 * Générée localement : rien n'est enregistré ni transmis.
 */
export function DoctorSummary({
  condition,
  answers,
  level,
}: {
  condition: Condition;
  answers: TriageOption[];
  level: TriageLevel;
}) {
  const [copied, setCopied] = useState(false);
  const text = buildDoctorSummary(condition, answers, level);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="rounded-xl border border-care/20 bg-care/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-foreground">À montrer à votre médecin</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Présentez cet écran en consultation, ou copiez le texte pour le coller dans le dossier.
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-lg bg-care px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-care/90 print:hidden"
        >
          {copied ? <ClipboardCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copié" : "Copier la synthèse"}
        </button>
      </div>

      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg border border-border bg-background p-4 text-sm text-foreground">
        {text}
      </pre>

      <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-care" />
        Aucune donnée n'est enregistrée ni envoyée : cette synthèse existe uniquement dans votre navigateur et disparaît
        quand vous fermez la page.
      </p>
    </section>
  );
}
