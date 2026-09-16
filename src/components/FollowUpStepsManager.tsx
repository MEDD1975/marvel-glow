import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ListChecks, Pencil, Plus, Trash2, X } from "lucide-react";
import type { FollowUpAnswer, FollowUpStepRecord } from "@/lib/follow-up-db";

type AnswerDraft = { id: string; label: string; action: "continue" | "redirect"; redirectMessage: string };

type StepDraft = {
  title: string;
  instruction: string;
  delayText: string;
  hasQuestion: boolean;
  question: string;
  answers: AnswerDraft[];
};

function newAnswer(): AnswerDraft {
  return { id: `draft_${Math.random().toString(36).slice(2)}`, label: "", action: "continue", redirectMessage: "" };
}

function emptyDraft(): StepDraft {
  return { title: "", instruction: "", delayText: "", hasQuestion: false, question: "", answers: [newAnswer(), newAnswer()] };
}

function draftFromRecord(step: FollowUpStepRecord): StepDraft {
  return {
    title: step.title,
    instruction: step.instruction,
    delayText: step.delayText ?? "",
    hasQuestion: Boolean(step.question),
    question: step.question ?? "",
    answers: step.answers.length
      ? step.answers.map((answer) => ({ id: answer.id, label: answer.label, action: answer.action, redirectMessage: answer.redirectMessage ?? "" }))
      : [newAnswer(), newAnswer()],
  };
}

export function FollowUpStepsManager({ conditionId, conditionLabel }: { conditionId: string; conditionLabel: string }) {
  const [steps, setSteps] = useState<FollowUpStepRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<StepDraft>(emptyDraft);
  const [notice, setNotice] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetch(`/api/follow-up-steps?conditionId=${encodeURIComponent(conditionId)}`)
      .then(async (response) => (response.ok ? ((await response.json()) as FollowUpStepRecord[]) : []))
      .then((rows) => {
        if (!cancelled) setSteps(rows);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [conditionId]);

  const resetForm = () => {
    setEditingId(null);
    setDraft(emptyDraft());
  };

  const buildPayload = () => {
    const answers: FollowUpAnswer[] = draft.hasQuestion
      ? draft.answers
          .filter((answer) => answer.label.trim())
          .map((answer) => ({
            id: answer.id.startsWith("draft_") ? `answer_${Math.random().toString(36).slice(2)}` : answer.id,
            label: answer.label.trim(),
            action: answer.action,
            redirectMessage: answer.action === "redirect" ? answer.redirectMessage.trim() || null : null,
          }))
      : [];
    return {
      title: draft.title.trim(),
      instruction: draft.instruction.trim(),
      delayText: draft.delayText.trim() || null,
      question: draft.hasQuestion ? draft.question.trim() || null : null,
      answers,
    };
  };

  const submit = async () => {
    const payload = buildPayload();
    if (!payload.title) {
      setNotice({ type: "error", message: "Le titre de l’étape est obligatoire." });
      return;
    }
    if (draft.hasQuestion) {
      if (!payload.question) {
        setNotice({ type: "error", message: "Saisissez le texte de la question de contrôle ou désactivez-la." });
        return;
      }
      if (payload.answers.length < 2) {
        setNotice({ type: "error", message: "Une question de contrôle doit proposer 2 ou 3 réponses." });
        return;
      }
    }
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch("/api/follow-up-steps", {
        method: editingId ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : { conditionId, ...payload }),
      });
      const result = (await response.json()) as FollowUpStepRecord & { error?: string };
      if (!response.ok || !result.id) {
        setNotice({ type: "error", message: result.error ?? "L’enregistrement a échoué. Réessayez." });
        return;
      }
      setSteps((current) => (editingId ? current.map((step) => (step.id === result.id ? result : step)) : [...current, result]));
      resetForm();
      setNotice({ type: "success", message: editingId ? "Étape mise à jour." : "Étape ajoutée : elle apparaît dans le suivi du patient." });
    } catch {
      setNotice({ type: "error", message: "L’enregistrement a échoué. Vérifiez votre connexion et réessayez." });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    const response = await fetch("/api/follow-up-steps", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
    if (!response.ok) {
      setNotice({ type: "error", message: "La suppression a échoué. Réessayez." });
      return;
    }
    setSteps((current) => current.filter((step) => step.id !== id));
    if (editingId === id) resetForm();
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= steps.length) return;
    const next = [...steps];
    const moved = next[index];
    const swapped = next[target];
    if (!moved || !swapped) return;
    next[index] = swapped;
    next[target] = moved;
    setSteps(next);
    await fetch("/api/follow-up-steps", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ conditionId, reorder: next.map((step) => step.id) }),
    });
  };

  const updateAnswer = (id: string, patch: Partial<AnswerDraft>) => {
    setDraft((current) => ({ ...current, answers: current.answers.map((answer) => (answer.id === id ? { ...answer, ...patch } : answer)) }));
  };

  const canAddAnswer = draft.answers.length < 3;

  const orderedSteps = useMemo(() => steps, [steps]);

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <ListChecks className="h-5 w-5 text-care" aria-hidden="true" />
        <div>
<p className="text-xs font-semibold uppercase tracking-wide text-care">Optionnel</p>
  <h3 className="mt-0.5 text-lg font-semibold text-foreground">Ajouter des étapes personnalisées — {conditionLabel}</h3>
        </div>
        <span className="ml-auto rounded-full bg-care/10 px-2 py-1 text-xs font-medium text-care">{orderedSteps.length}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Composez, dans l’ordre, les étapes que votre patient verra. Chaque étape peut inclure une question de contrôle qui l’oriente vers l’annuaire si nécessaire. Rien n’est pré-rempli : vous rédigez l’intégralité du contenu.
      </p>

      {/* Liste des étapes existantes */}
      <div className="mt-5 flex flex-col gap-3">
        {loading ? (
          <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">Chargement des étapes…</p>
        ) : orderedSteps.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-4 text-sm leading-6 text-muted-foreground">Aucune étape pour ce trouble. Ajoutez la première étape ci-dessous pour démarrer le suivi.</p>
        ) : (
          orderedSteps.map((step, index) => (
            <article key={step.id} className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-start gap-3">
                <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-care/10 text-sm font-semibold text-care">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{step.title}</p>
                  {step.delayText ? <p className="mt-0.5 text-xs font-medium text-care">{step.delayText}</p> : null}
                  {step.instruction ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.instruction}</p> : null}
                  {step.question ? (
                    <div className="mt-2 rounded-lg border border-border bg-card p-2.5">
                      <p className="text-xs font-semibold text-foreground">Question : {step.question}</p>
                      <ul className="mt-1 space-y-0.5">
                        {step.answers.map((answer) => (
                          <li key={answer.id} className="text-xs text-muted-foreground">
                            • {answer.label} — {answer.action === "redirect" ? "oriente vers un professionnel" : "continue le suivi"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-center gap-1">
                  <button type="button" onClick={() => void move(index, -1)} disabled={index === 0} aria-label="Monter l’étape" className="rounded-md p-1.5 text-muted-foreground hover:bg-accent disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                  <button type="button" onClick={() => void move(index, 1)} disabled={index === orderedSteps.length - 1} aria-label="Descendre l’étape" className="rounded-md p-1.5 text-muted-foreground hover:bg-accent disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button type="button" onClick={() => { setEditingId(step.id); setDraft(draftFromRecord(step)); setNotice(null); }} className="inline-flex items-center gap-1.5 rounded-lg border border-care/40 px-2.5 py-1.5 text-xs font-semibold text-care hover:bg-care/10"><Pencil className="h-3.5 w-3.5" /> Modifier</button>
                <button type="button" onClick={() => void remove(step.id)} aria-label={`Supprimer ${step.title}`} className="inline-flex items-center gap-1.5 rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Formulaire d'ajout / édition */}
      <div className="mt-6 rounded-xl border border-care/25 bg-care/5 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">{editingId ? "Modifier l’étape" : "Ajouter une étape"}</p>
          {editingId ? (
            <button type="button" onClick={resetForm} className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /> Annuler</button>
          ) : null}
        </div>

        <label htmlFor="step-title" className="mt-3 block text-sm font-medium text-foreground">Titre de l’étape <span className="font-normal text-muted-foreground">(obligatoire)</span></label>
        <input id="step-title" value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Ex. Premiers jours" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" />

        <label htmlFor="step-instruction" className="mt-3 block text-sm font-medium text-foreground">Consigne</label>
        <textarea id="step-instruction" rows={2} value={draft.instruction} onChange={(event) => setDraft((current) => ({ ...current, instruction: event.target.value }))} placeholder="Ex. Glace, repos, surélévation" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" />

        <label htmlFor="step-delay" className="mt-3 block text-sm font-medium text-foreground">Délai indicatif <span className="font-normal text-muted-foreground">(optionnel)</span></label>
        <input id="step-delay" value={draft.delayText} onChange={(event) => setDraft((current) => ({ ...current, delayText: event.target.value }))} placeholder="Ex. Les premiers jours" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" />
        <p className="mt-1 text-xs text-muted-foreground">Texte affiché tel quel au patient. Aucune date n’est calculée automatiquement.</p>

        <label className="mt-4 flex items-center gap-2 text-sm font-medium text-foreground">
          <input type="checkbox" checked={draft.hasQuestion} onChange={(event) => setDraft((current) => ({ ...current, hasQuestion: event.target.checked }))} className="h-4 w-4 rounded border-input text-care focus:ring-ring" />
          Ajouter une question de contrôle
        </label>

        {draft.hasQuestion ? (
          <div className="mt-3 space-y-3 rounded-lg border border-border bg-card p-3">
            <div>
              <label htmlFor="step-question" className="block text-sm font-medium text-foreground">Question posée au patient</label>
              <input id="step-question" value={draft.question} onChange={(event) => setDraft((current) => ({ ...current, question: event.target.value }))} placeholder="Ex. La douleur a-t-elle diminué ?" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Réponses proposées (2 à 3)</p>
            {draft.answers.map((answer, answerIndex) => (
              <div key={answer.id} className="rounded-lg border border-border bg-background p-3">
                <div className="flex items-center gap-2">
                  <input value={answer.label} onChange={(event) => updateAnswer(answer.id, { label: event.target.value })} placeholder={`Réponse ${answerIndex + 1} (ex. Oui, ça va mieux)`} className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" aria-label={`Texte de la réponse ${answerIndex + 1}`} />
                  {draft.answers.length > 2 ? (
                    <button type="button" onClick={() => setDraft((current) => ({ ...current, answers: current.answers.filter((item) => item.id !== answer.id) }))} aria-label="Retirer cette réponse" className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  ) : null}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor={`answer-action-${answer.id}`}>Effet</label>
                  <select id={`answer-action-${answer.id}`} value={answer.action} onChange={(event) => updateAnswer(answer.id, { action: event.target.value as "continue" | "redirect" })} className="rounded-lg border border-input bg-background px-2 py-1.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring">
                    <option value="continue">Continuer le suivi</option>
                    <option value="redirect">Orienter vers un professionnel</option>
                  </select>
                </div>
                {answer.action === "redirect" ? (
                  <input value={answer.redirectMessage} onChange={(event) => updateAnswer(answer.id, { redirectMessage: event.target.value })} placeholder="Message d’orientation (ex. Ce signal justifie un avis rapide)" className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" aria-label="Message d’orientation" />
                ) : null}
              </div>
            ))}
            {canAddAnswer ? (
              <button type="button" onClick={() => setDraft((current) => ({ ...current, answers: [...current.answers, newAnswer()] }))} className="inline-flex items-center gap-1.5 text-xs font-semibold text-care hover:underline"><Plus className="h-3.5 w-3.5" /> Ajouter une réponse</button>
            ) : null}
          </div>
        ) : null}

        {notice ? (
          <p role={notice.type === "error" ? "alert" : "status"} className={`mt-3 rounded-lg px-3 py-2 text-sm leading-5 ${notice.type === "error" ? "bg-destructive/10 text-destructive" : "bg-care/10 text-care"}`}>{notice.message}</p>
        ) : null}

        <button type="button" onClick={() => void submit()} disabled={saving || !draft.title.trim()} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-care px-4 py-2.5 text-sm font-semibold text-care-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
          {saving ? "Enregistrement…" : editingId ? "Enregistrer les modifications" : "Ajouter l’étape"}
        </button>
      </div>
    </section>
  );
}
