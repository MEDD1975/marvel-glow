import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, BarChart3, CalendarDays, Check, MessageCircle, Pencil, Plus, ScanSearch, Sparkles, Trash2 } from "lucide-react";
import type { Condition } from "@/lib/conditions";
import { providers } from "@/lib/directory";

type TimelineEntry = {
  id: string;
  type: string;
  date: string;
  notes: string;
  done: boolean;
  pain?: number | null;
  providerId?: string;
  providerName?: string;
};

const entryTypes = ["Médecin traitant", "Spécialiste", "Imagerie / Examen", "Autre démarche"];
const PROGRESS_STEP_ID = "observe";

type Draft = { type: string; date: string; notes: string; pain: number | null; providerId: string; providerName: string };

function DraftForm({ draft, setDraft, onSave, onCancel, variant = "appointment" }: { draft: Draft; setDraft: (draft: Draft) => void; onSave: () => void; onCancel: () => void; variant?: "appointment" | "progress" }) {
  const isProgress = variant === "progress";
  return (
    <div className="rounded-2xl border border-border bg-muted/20 p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="text-sm font-medium text-foreground md:col-span-1">Professionnel
          <select value={draft.providerId} onChange={(event) => { const provider = providers.find((item) => item.id === event.target.value); setDraft({ ...draft, providerId: event.target.value, providerName: provider?.name ?? "", type: provider?.profession ?? draft.type }); }} className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"><option value="">Saisir librement ci-dessous</option>{providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.name} — {provider.profession}</option>)}</select>
          <input type="text" value={draft.providerName || draft.type} onChange={(event) => setDraft({ ...draft, providerId: "", providerName: event.target.value, type: event.target.value })} placeholder="Nom ou profession" className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" />
        </label>
        <label className="text-sm font-medium text-foreground">Date<input type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
        <label className="text-sm font-medium text-foreground md:col-span-1">Une note <textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} maxLength={240} rows={2} placeholder={isProgress ? "Ce que j’observe aujourd’hui (gêne, mobilité, progrès…)" : "Question à poser au prochain rendez-vous"} className="mt-1.5 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm" /></label>
      </div>

      {isProgress && (
        <fieldset className="mt-3 rounded-xl border border-border bg-background p-3">
          <legend className="px-1 text-sm font-medium text-foreground">Comment j’évalue ma douleur aujourd’hui&nbsp;?</legend>
          <div className="mt-2 flex items-center gap-3">
            <input type="range" min={0} max={10} step={1} value={draft.pain ?? 0} onChange={(event) => setDraft({ ...draft, pain: Number(event.target.value) })} aria-label="Niveau de douleur de 0 à 10" className="h-2 w-full cursor-pointer accent-care" />
            <span className="w-14 shrink-0 text-right text-sm font-semibold text-foreground">{draft.pain == null ? "—" : `${draft.pain}/10`}</span>
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground"><span>Aucune douleur</span><span>Douleur maximale</span></div>
          {draft.pain != null && <button type="button" onClick={() => setDraft({ ...draft, pain: null })} className="mt-2 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Effacer l’évaluation</button>}
        </fieldset>
      )}

      <div className="mt-3 flex gap-2"><button type="button" onClick={onSave} disabled={!draft.type.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">Enregistrer localement</button><button type="button" onClick={onCancel} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold">Annuler</button></div>
    </div>
  );
}

const defaultEntries = (condition?: Condition | null): TimelineEntry[] => [
  { id: "diagnosis-understanding", type: "Comprendre mon diagnostic", date: "", notes: condition ? `Informations reçues concernant ${condition.name}.` : "", done: false },
  { id: "care-and-specialists", type: "Mes séances & mes rendez-vous", date: "", notes: "", done: false },
  { id: PROGRESS_STEP_ID, type: "Suivre mes progrès au quotidien", date: "", notes: "", done: false, pain: null },
  { id: "follow-up", type: "Préparer mon prochain échange", date: "", notes: "", done: false },
];

function storageKey(conditionId?: string) {
  return `kivoir-local-timeline:${conditionId ?? "general"}`;
}

function formatDate(value: string) {
  if (!value) return "Aucune date ajoutée";
  return new Intl.DateTimeFormat("fr-FR").format(new Date(`${value}T12:00:00`));
}

function StepIcon({ id }: { id: string }) {
  const Icon = id === "diagnosis-understanding" ? ScanSearch : id === "care-and-specialists" ? CalendarDays : id === PROGRESS_STEP_ID ? BarChart3 : id === "follow-up" ? MessageCircle : Sparkles;
  return <Icon className="size-5" aria-hidden="true" />;
}

export function LocalCareTimeline({ condition }: { condition: Condition | null }) {
  const key = storageKey(condition?.id);
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>({ type: "", date: "", notes: "", pain: null, providerId: "", providerName: "" });

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(key);
      setEntries(saved ? (JSON.parse(saved) as TimelineEntry[]) : defaultEntries(condition));
    } catch {
      setEntries(defaultEntries(condition));
    }
  }, [key, condition]);

  const sortedEntries = entries;
  const completedCount = entries.filter((entry) => entry.done).length;
  const progressPercent = entries.length ? Math.round((completedCount / entries.length) * 100) : 0;
  const persist = (next: TimelineEntry[]) => {
    setEntries(next);
    window.localStorage.setItem(key, JSON.stringify(next));
  };
  const startAdding = () => {
    setEditingId(null);
    setDraft({ type: "", date: "", notes: "", pain: null, providerId: "", providerName: "" });
    setIsAdding(true);
  };
  const startEditing = (entry: TimelineEntry) => {
    setIsAdding(false);
    setEditingId(entry.id);
    setDraft({ type: entry.type, date: entry.date, notes: entry.notes, pain: entry.pain ?? null, providerId: entry.providerId ?? "", providerName: entry.providerName ?? entry.type });
  };
  const cancelDraft = () => {
    setIsAdding(false);
    setEditingId(null);
    setDraft({ type: "", date: "", notes: "", pain: null, providerId: "", providerName: "" });
  };
  const saveDraft = () => {
    if (!draft.type.trim()) return;
    const next = editingId
      ? entries.map((entry) => entry.id === editingId ? { ...entry, ...draft } : entry)
      : [...entries, { id: crypto.randomUUID(), ...draft, done: false }];
    persist(next);
    setDraft({ type: "", date: "", notes: "", pain: null, providerId: "", providerName: "" });
    setEditingId(null);
    setIsAdding(false);
  };
  const remove = (id: string) => persist(entries.filter((entry) => entry.id !== id));
  const moveEntry = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= entries.length) return;
    const next = [...entries];
    [next[index], next[target]] = [next[target], next[index]];
    persist(next);
  };
  const toggleDone = (id: string) => persist(entries.map((entry) => entry.id === id ? { ...entry, done: !entry.done } : entry));
  const reset = () => {
    const next = defaultEntries(condition);
    window.localStorage.setItem(key, JSON.stringify(next));
    setEntries(next);
  };

  return (
    <section className="mt-10 overflow-hidden rounded-[2rem] border border-care/20 bg-card shadow-[0_20px_60px_-32px_hsl(var(--care)/0.45)]" aria-labelledby="local-timeline-title">
      <div className="bg-gradient-to-br from-care/10 via-card to-background p-5 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-care"><Sparkles className="size-4" aria-hidden="true" /> Mon parcours</p>
            <h2 id="local-timeline-title" className="mt-3 text-2xl font-bold tracking-tight text-foreground md:text-3xl">Mes étapes, simplement</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Un petit pas à la fois. Cochez ce qui est fait et gardez vos repères près de vous.</p>
          </div>
          <div className="rounded-2xl border border-care/20 bg-background/80 px-4 py-3 text-right shadow-sm">
            <p className="text-2xl font-bold text-care">{completedCount} <span className="text-base font-medium text-muted-foreground">/ {entries.length}</span></p>
            <p className="text-xs font-medium text-muted-foreground">étapes réalisées</p>
          </div>
        </div>
        <div className="mt-6" aria-label={`${completedCount} sur ${entries.length} étapes réalisées`} role="progressbar" aria-valuemin={0} aria-valuemax={entries.length} aria-valuenow={completedCount}>
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted-foreground"><span>Votre progression</span><span>{progressPercent}%</span></div>
          <div className="h-2.5 overflow-hidden rounded-full bg-care/10"><div className="h-full rounded-full bg-care transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }} /></div>
        </div>
      </div>
      <div className="p-5 md:p-7">

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={startAdding} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-primary/90"><Plus className="size-4" aria-hidden="true" /> Ajouter un rendez-vous</button>
        <button type="button" onClick={reset} className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:bg-muted hover:text-foreground hover:underline">Recommencer</button>
      </div>

      <div className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${isAdding ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`} aria-hidden={!isAdding}>
        <div className="min-h-0 overflow-hidden"><DraftForm draft={draft} setDraft={setDraft} onSave={saveDraft} onCancel={cancelDraft} /></div>
      </div>

      <ol className="mt-6 space-y-3">
        {sortedEntries.map((entry, index) => (
          <li key={entry.id} className={`group rounded-2xl border p-4 transition-all duration-300 md:p-5 ${editingId === entry.id ? "border-care/40 bg-care/[0.04] shadow-md" : entry.done ? "border-care/20 bg-care/[0.04]" : "border-border bg-background hover:-translate-y-0.5 hover:border-care/30 hover:shadow-lg"}`}>
            {editingId === entry.id ? (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300"><DraftForm draft={draft} setDraft={setDraft} onSave={saveDraft} onCancel={cancelDraft} variant={entry.id === PROGRESS_STEP_ID ? "progress" : "appointment"} /></div>
            ) : (
              <div className="flex gap-3">
                <button type="button" onClick={() => toggleDone(entry.id)} aria-label={entry.done ? "Marquer comme à revoir" : "Marquer comme fait"} aria-pressed={entry.done} className={`flex size-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${entry.done ? "bg-care text-care-foreground shadow-sm" : "bg-muted text-muted-foreground group-hover:bg-care/10 group-hover:text-care"}`}><span className="text-sm font-bold">{entry.done ? <Check className="size-5" aria-hidden="true" /> : index + 1}</span></button>
                <div className="min-w-0 flex-1"><div className="flex items-start gap-3"><span className={`mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl ${entry.done ? "bg-care/15 text-care" : "bg-muted text-muted-foreground"}`}><StepIcon id={entry.id} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-3 gap-y-1"><h3 className="font-semibold text-foreground">{entry.type}</h3>{entry.date && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="size-3.5" aria-hidden="true" />{new Date(`${entry.date}T12:00:00`) < new Date() ? "Vu le" : "Prévu le"} {formatDate(entry.date)}</span>}{entry.pain != null && <span className="inline-flex items-center rounded-full bg-care/10 px-2 py-0.5 text-xs font-semibold text-care">Douleur&nbsp;{entry.pain}/10</span>}</div>{entry.notes && <p className="mt-1 text-sm text-muted-foreground">{entry.notes}</p>}</div></div></div>
                <div className="flex shrink-0 gap-1 opacity-70 transition-opacity group-hover:opacity-100"><button type="button" onClick={() => moveEntry(index, -1)} disabled={index === 0} aria-label={`Monter ${entry.type}`} className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"><ArrowUp className="size-4" aria-hidden="true" /></button><button type="button" onClick={() => moveEntry(index, 1)} disabled={index === sortedEntries.length - 1} aria-label={`Descendre ${entry.type}`} className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"><ArrowDown className="size-4" aria-hidden="true" /></button><button type="button" onClick={() => startEditing(entry)} aria-label={`Modifier ${entry.type}`} className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Pencil className="size-4" aria-hidden="true" /></button><button type="button" onClick={() => remove(entry.id)} aria-label={`Supprimer ${entry.type}`} className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"><Trash2 className="size-4" aria-hidden="true" /></button></div>
              </div>
            )}
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs text-muted-foreground">Vos données restent uniquement sur cet appareil.</p>
      </div>
    </section>
  );
}

export { storageKey as localCareTimelineStorageKey };
export type { TimelineEntry as TimelineStep };
