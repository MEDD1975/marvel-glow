import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Eye, Pencil, Plus, Trash2, Users } from "lucide-react";
import type { Condition } from "@/lib/conditions";

type TimelineEntry = {
  id: string;
  type: string;
  date: string;
  notes: string;
  done: boolean;
};

const entryTypes = ["Médecin traitant", "Kinésithérapeute", "Spécialiste", "Imagerie / Examen", "Autre démarche"];

const defaultEntries = (condition?: Condition | null): TimelineEntry[] => [
  { id: "diagnosis-understanding", type: "Diagnostic & Compréhension", date: "", notes: condition ? `Informations reçues concernant ${condition.name}.` : "", done: false },
  { id: "care-and-specialists", type: "Protocoles & Soins / Spécialistes", date: "", notes: "", done: false },
  { id: "observe", type: "Observer mon évolution", date: "", notes: "", done: false },
  { id: "follow-up", type: "Préparer le point de suivi", date: "", notes: "", done: false },
];

function storageKey(conditionId?: string) {
  return `kivoir-local-timeline:${conditionId ?? "general"}`;
}

function formatDate(value: string) {
  if (!value) return "Date non renseignée";
  return new Intl.DateTimeFormat("fr-FR").format(new Date(`${value}T12:00:00`));
}

export function LocalCareTimeline({ condition }: { condition: Condition | null }) {
  const key = storageKey(condition?.id);
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [isShareMode, setIsShareMode] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ type: entryTypes[0], date: "", notes: "" });

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(key);
      setEntries(saved ? (JSON.parse(saved) as TimelineEntry[]) : defaultEntries(condition));
    } catch {
      setEntries(defaultEntries(condition));
    }
  }, [key, condition]);

  const sortedEntries = useMemo(() => [...entries].sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999")), [entries]);
  const persist = (next: TimelineEntry[]) => {
    setEntries(next);
    window.localStorage.setItem(key, JSON.stringify(next));
  };
  const saveDraft = () => {
    const next = editingId
      ? entries.map((entry) => entry.id === editingId ? { ...entry, ...draft } : entry)
      : [...entries, { id: crypto.randomUUID(), ...draft, done: false }];
    persist(next);
    setDraft({ type: entryTypes[0], date: "", notes: "" });
    setEditingId(null);
    setIsAdding(false);
  };
  const remove = (id: string) => persist(entries.filter((entry) => entry.id !== id));
  const toggleDone = (id: string) => persist(entries.map((entry) => entry.id === id ? { ...entry, done: !entry.done } : entry));
  const reset = () => {
    const next = defaultEntries(condition);
    window.localStorage.setItem(key, JSON.stringify(next));
    setEntries(next);
  };

  return (
    <section className="mt-10 rounded-3xl border border-care/20 bg-card p-5 shadow-sm md:p-6" aria-labelledby="local-timeline-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-care">Mon parcours &amp; étapes</p>
          <h2 id="local-timeline-title" className="mt-2 text-2xl font-semibold text-foreground">Mes repères, à mon rythme</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Ajoutez vos rendez-vous et démarches pour préparer vos échanges. Cet outil est informatif et ne pose aucun diagnostic.</p>
        </div>
        <button type="button" onClick={() => setIsShareMode((value) => !value)} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted" aria-pressed={isShareMode}>
          {isShareMode ? <Eye className="h-4 w-4" aria-hidden="true" /> : <Users className="h-4 w-4" aria-hidden="true" />}
          {isShareMode ? "Quitter le mode consultation" : "Mode consultation / partage"}
        </button>
      </div>

      {!isShareMode && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" onClick={() => setIsAdding(true)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4" aria-hidden="true" /> Ajouter une étape / un professionnel</button>
          <button type="button" onClick={reset} className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted">Réinitialiser la frise</button>
        </div>
      )}

      {(isAdding || editingId) && !isShareMode && (
        <div className="mt-4 rounded-2xl border border-border bg-muted/20 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm font-medium text-foreground">Professionnel ou jalon<select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value })} className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"><option value="Diagnostic & Compréhension">Diagnostic &amp; Compréhension</option>{entryTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
            <label className="text-sm font-medium text-foreground">Date<input type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
            <label className="text-sm font-medium text-foreground md:col-span-1">Note logistique <textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} maxLength={240} rows={2} placeholder="Question à poser au prochain rendez-vous" className="mt-1.5 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm" /></label>
          </div>
          <div className="mt-3 flex gap-2"><button type="button" onClick={saveDraft} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Enregistrer localement</button><button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold">Annuler</button></div>
        </div>
      )}

      <ol className="mt-6 space-y-3">
        {sortedEntries.map((entry, index) => (
          <li key={entry.id} className="relative flex gap-3 rounded-2xl border border-border bg-background p-4">
            <button type="button" onClick={() => toggleDone(entry.id)} aria-label={entry.done ? "Marquer comme à revoir" : "Marquer comme fait"} aria-pressed={entry.done} className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${entry.done ? "bg-care text-care-foreground" : "bg-muted text-muted-foreground"}`}>{entry.done ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}</button>
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-3 gap-y-1"><h3 className="font-semibold text-foreground">{entry.type}</h3><span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />{formatDate(entry.date)}</span></div>{entry.notes && <p className="mt-1 text-sm text-muted-foreground">{entry.notes}</p>}</div>
            {!isShareMode && <div className="flex shrink-0 gap-1"><button type="button" onClick={() => { setEditingId(entry.id); setDraft({ type: entry.type, date: entry.date, notes: entry.notes }); }} aria-label="Modifier cette étape" className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4" aria-hidden="true" /></button><button type="button" onClick={() => remove(entry.id)} aria-label="Supprimer cette étape" className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-destructive"><Trash2 className="h-4 w-4" aria-hidden="true" /></button></div>}
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs text-muted-foreground">Vos étapes et notes restent uniquement sur cet appareil, dans le stockage local du navigateur. Rien n’est transmis ni enregistré sur un serveur.</p>
    </section>
  );
}

export { storageKey as localCareTimelineStorageKey };
export type { TimelineEntry as TimelineStep };
