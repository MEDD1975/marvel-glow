import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
import { providers } from "@/lib/directory";

type TimelineEntry = {
  id: string;
  type: string;
  date: string;
  notes: string;
  providerId?: string;
  providerName?: string;
};

type Draft = { type: string; date: string; notes: string; providerId: string; providerName: string };

function DraftForm({ draft, setDraft, onSave, onCancel }: { draft: Draft; setDraft: (draft: Draft) => void; onSave: () => void; onCancel: () => void }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/20 p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="text-sm font-medium text-foreground md:col-span-1">Professionnel
          <select required aria-label="Professionnel de santé" value={draft.providerId} onChange={(event) => { const provider = providers.find((item) => item.id === event.target.value); setDraft({ ...draft, providerId: event.target.value, providerName: provider?.name ?? "", type: provider?.profession ?? draft.type }); }} className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"><option value="">Saisir librement ci-dessous</option>{providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.name} — {provider.profession}</option>)}</select>
          <input type="text" value={draft.providerName} onChange={(event) => setDraft({ ...draft, providerId: "", providerName: event.target.value, type: event.target.value })} placeholder="Nom ou profession" className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" />
        </label>
        <label className="text-sm font-medium text-foreground">Date<input required aria-label="Date du rendez-vous ou de la consultation" type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
        <label className="text-sm font-medium text-foreground md:col-span-1">Une note <textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} maxLength={240} rows={2} placeholder="Ce qui m’a été dit ou prescrit…" className="mt-1.5 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm" /></label>
      </div>


      <div className="mt-3 flex gap-2"><button type="button" onClick={onSave} disabled={!draft.type.trim() || !draft.providerName.trim() || !draft.date} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">Enregistrer localement</button><button type="button" onClick={onCancel} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold">Annuler</button></div>
    </div>
  );
}

function storageKey(conditionId?: string) {
  return `kivoir-local-timeline:${conditionId ?? "general"}`;
}

function formatDate(value: string) {
  if (!value) return "Aucune date ajoutée";
  return new Intl.DateTimeFormat("fr-FR").format(new Date(`${value}T12:00:00`));
}

export function LocalCareTimeline() {
  const key = storageKey();
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>({ type: "", date: "", notes: "", providerId: "", providerName: "" });

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(key);
      setEntries(saved ? (JSON.parse(saved) as TimelineEntry[]) : []);
    } catch {
      setEntries([]);
    }
  }, [key]);

  const sortedEntries = entries;

  const persist = (next: TimelineEntry[]) => {
    setEntries(next);
    window.localStorage.setItem(key, JSON.stringify(next));
  };
  const startAdding = () => {
    setEditingId(null);
    setDraft({ type: "", date: "", notes: "", providerId: "", providerName: "" });
    setIsAdding(true);
  };
  const startEditing = (entry: TimelineEntry) => {
    setIsAdding(false);
    setEditingId(entry.id);
    setDraft({ type: entry.type, date: entry.date, notes: entry.notes, providerId: entry.providerId ?? "", providerName: entry.providerName ?? entry.type });
  };
  const cancelDraft = () => {
    setIsAdding(false);
    setEditingId(null);
    setDraft({ type: "", date: "", notes: "", providerId: "", providerName: "" });
  };
  const saveDraft = () => {
    if (!draft.type.trim() || !draft.providerName.trim() || !draft.date) return;
    const next = editingId
      ? entries.map((entry) => entry.id === editingId ? { ...entry, ...draft } : entry)
      : [...entries, { id: crypto.randomUUID(), ...draft }];
    persist(next);
    setDraft({ type: "", date: "", notes: "", providerId: "", providerName: "" });
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
  const reset = () => {
    window.localStorage.removeItem(key);
    setEntries([]);
  };

  return (
    <section className="mt-10 overflow-hidden rounded-[2rem] border border-care/20 bg-card shadow-[0_20px_60px_-32px_hsl(var(--care)/0.45)]" aria-labelledby="local-timeline-title">
      <div className="bg-gradient-to-br from-care/10 via-card to-background p-5 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-care">Mon parcours de soins</p>
            <h2 id="local-timeline-title" className="mt-3 text-2xl font-bold tracking-tight text-foreground md:text-3xl">Les professionnels qui m’accompagnent</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Notez librement les professionnels vus ou prévus, dans l’ordre de votre parcours.</p>
          </div>
        </div>
      </div>
      <div className="p-5 md:p-7">

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={startAdding} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-primary/90"><Plus className="size-4" aria-hidden="true" /> Ajouter une entrée</button>
        <button type="button" onClick={reset} className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:bg-muted hover:text-foreground hover:underline">Recommencer</button>
      </div>

      <div className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${isAdding ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`} aria-hidden={!isAdding}>
        <div className="min-h-0 overflow-hidden"><DraftForm draft={draft} setDraft={setDraft} onSave={saveDraft} onCancel={cancelDraft} /></div>
      </div>

      <ol className="mt-6 space-y-3">
        {sortedEntries.map((entry, index) => (
          <li key={entry.id} className={`group rounded-2xl border p-4 transition-all duration-300 md:p-5 ${editingId === entry.id ? "border-care/40 bg-care/[0.04] shadow-md" : "border-border bg-background hover:-translate-y-0.5 hover:border-care/30 hover:shadow-lg"}`}>
            {editingId === entry.id ? (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300"><DraftForm draft={draft} setDraft={setDraft} onSave={saveDraft} onCancel={cancelDraft} /></div>
            ) : (
              <div className="flex gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-care/10 text-lg font-bold text-care">{index + 1}</div>
                <div className="min-w-0 flex-1"><div className="flex items-start gap-3"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-3 gap-y-1"><h3 className="font-semibold text-foreground">{entry.providerName || entry.type}</h3>{entry.date && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="size-3.5" aria-hidden="true" />{new Date(`${entry.date}T12:00:00`) < new Date() ? "Vu le" : "Prévu le"} {formatDate(entry.date)}</span>}</div>{entry.notes && <p className="mt-1 text-sm text-muted-foreground">{entry.notes}</p>}</div></div></div>
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
