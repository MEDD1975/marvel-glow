import { createFileRoute } from "@tanstack/react-router";
import { type FormEvent, useMemo, useState } from "react";
import { Check, ChevronDown, GripVertical, Pencil, Plus, X } from "lucide-react";
import { DoctorHeader, DoctorPage } from "@/components/doctor/DoctorLayout";
import { conditions } from "@/lib/conditions";
import { getPathwayGuide } from "@/lib/patient-guides";
import { doctorKeys, sendJson, useDoctorCache, useDoctorResources } from "@/components/doctor/use-doctor-data";

export const Route = createFileRoute("/cabinet/conseils")({
  head: () => ({ meta: [{ title: "Conseils à appliquer — Kivoir" }] }),
  component: AdviceReviewPage,
});

function AdviceReviewPage() {
  const [selectedPathwayId, setSelectedPathwayId] = useState("entorse-cheville");
  const [isAddAdviceOpen, setIsAddAdviceOpen] = useState(false);
  const [newAdviceTitle, setNewAdviceTitle] = useState("");
  const [newAdviceSummary, setNewAdviceSummary] = useState("");
  const [customAdvice, setCustomAdvice] = useState<Record<string, Array<{ title: string; summary: string }>>>({});
  const [hiddenAdvice, setHiddenAdvice] = useState<Record<string, string[]>>({});
  const [editedAdvice, setEditedAdvice] = useState<Record<string, Record<string, { title: string; summary: string }>>>({});
  const [editingAdvice, setEditingAdvice] = useState<{ originalTitle: string; title: string; summary: string } | null>(null);
  const [recommendedProfessional, setRecommendedProfessional] = useState<Record<string, string>>({});
  const [isReferralSaved, setIsReferralSaved] = useState<Record<string, boolean>>({});
  const resources = useDoctorResources();
  const cache = useDoctorCache();
  const selectedCondition = conditions.find((condition) => condition.id === selectedPathwayId) ?? conditions[0];
  if (!selectedCondition) return null;

  const advice = useMemo(
    () => [
      ...(getPathwayGuide(selectedCondition.id)?.recommendations ?? []),
      ...(customAdvice[selectedCondition.id] ?? []),
    ].map((item) => editedAdvice[selectedCondition.id]?.[item.title] ?? item),
    [customAdvice, editedAdvice, selectedCondition.id],
  ).filter((item) => !(hiddenAdvice[selectedCondition.id] ?? []).includes(item.title));

  const hideAdvice = (title: string) => {
    setHiddenAdvice((current) => ({
      ...current,
      [selectedCondition.id]: [...(current[selectedCondition.id] ?? []), title],
    }));
  };

  const saveAdviceEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingAdvice || !editingAdvice.title.trim() || !editingAdvice.summary.trim()) return;
    setEditedAdvice((current) => ({
      ...current,
      [selectedCondition.id]: {
        ...(current[selectedCondition.id] ?? {}),
        [editingAdvice.originalTitle]: { title: editingAdvice.title.trim(), summary: editingAdvice.summary.trim() },
      },
    }));
    setEditingAdvice(null);
  };

  const saveReferral = async () => {
    const professional = recommendedProfessional[selectedCondition.id];
    if (!professional) return;
    const existing = resources.data?.find((resource) => resource.conditionId === selectedCondition.id && resource.kind === "orientation");
    await sendJson("/api/doctor-resources", existing ? "PATCH" : "POST", existing ? { id: existing.id, title: `À voir ensuite : ${professional}`, conditionId: selectedCondition.id, url: "/patient/parcours", description: "Orientation proposée par votre médecin.", kind: "orientation", status: "active" } : { title: `À voir ensuite : ${professional}`, conditionId: selectedCondition.id, url: "/patient/parcours", description: "Orientation proposée par votre médecin.", kind: "orientation" });
    await cache.invalidateQueries({ queryKey: doctorKeys.resources });
    setIsReferralSaved((current) => ({ ...current, [selectedCondition.id]: true }));
  };

  const addAdvice = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newAdviceTitle.trim() || !newAdviceSummary.trim()) return;
    setCustomAdvice((current) => ({
      ...current,
      [selectedCondition.id]: [...(current[selectedCondition.id] ?? []), { title: newAdviceTitle.trim(), summary: newAdviceSummary.trim() }],
    }));
    setIsAddAdviceOpen(false);
    setNewAdviceTitle("");
    setNewAdviceSummary("");
  };

  return (
    <DoctorPage>
      <DoctorHeader
        eyebrow="Contenu transmis au patient"
        title="Conseils à appliquer"
        description="Vérifiez les conseils proposés pour chaque parcours. Vous pouvez les conserver, les masquer ou les adapter sans avoir à tout recréer."
        actions={<button type="button" onClick={() => setIsAddAdviceOpen(true)} className="flex min-h-11 items-center gap-2 rounded-xl bg-care px-4 text-sm font-semibold text-care-foreground"><Plus className="h-4 w-4" aria-hidden="true" />Ajouter un conseil</button>}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
        <section className="min-w-0 rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6" aria-labelledby="advice-list-title">
          <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="advice-list-title" className="text-lg font-semibold text-foreground">Les conseils proposés</h2>
              <p className="mt-1 text-sm text-muted-foreground">{advice.length} conseils proposés · Parcours sélectionné : <span className="font-medium text-foreground">{selectedCondition.name}</span></p>
            </div>
            <label className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm text-foreground">
              <span className="sr-only">Choisir un parcours</span>
              <select
                className="bg-transparent outline-none"
                value={selectedPathwayId}
                onChange={(event) => setSelectedPathwayId(event.target.value)}
              >
                {conditions.map((condition) => <option key={condition.id} value={condition.id}>{condition.name}</option>)}
              </select>
            </label>
          </div>

          <div className="mt-4 rounded-2xl border border-[#C9DCF3] bg-[#F5F9FF] p-4">
            <label className="block text-sm font-semibold text-foreground" htmlFor="recommended-professional">Qui consulter ensuite ?</label>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Choisissez le professionnel à voir pour ce parcours. Cette indication sera affichée au patient avec vos conseils.</p>
            <select id="recommended-professional" value={recommendedProfessional[selectedCondition.id] ?? ""} onChange={(event) => { setRecommendedProfessional((current) => ({ ...current, [selectedCondition.id]: event.target.value })); setIsReferralSaved((current) => ({ ...current, [selectedCondition.id]: false })); }} className="mt-3 min-h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-foreground outline-none focus:border-care focus:ring-2 focus:ring-care/20">
              <option value="">Aucune orientation renseignée</option>
              <option value="Médecin généraliste">Médecin généraliste</option>
              <option value="Kinésithérapeute">Kinésithérapeute</option>
              <option value="Radiologue">Radiologue</option>
              <option value="Médecin du sport">Médecin du sport</option>
              <option value="Chirurgien orthopédiste">Chirurgien orthopédiste</option>
              <option value="Autre professionnel">Autre professionnel</option>
            </select>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {advice.map((item, index) => (
              <article key={item.title} className="flex gap-3 rounded-2xl border border-[#CFE3D9] bg-[#F5FBF8] p-3 sm:p-4">
                <button type="button" aria-label={`Réordonner ${item.title}`} className="mt-1 hidden h-10 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-white sm:flex"><GripVertical className="h-4 w-4" aria-hidden="true" /></button>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-care shadow-sm"><Check className="h-5 w-5" aria-hidden="true" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div><p className="text-xs font-semibold uppercase tracking-wide text-care">Conseil {index + 1}</p><h3 className="mt-1 font-semibold text-foreground">{item.title}</h3></div>
                    <span className="rounded-full bg-[#DDF4E8] px-2.5 py-1 text-xs font-medium text-[#18734E]">À conserver</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setEditingAdvice({ originalTitle: item.title, title: item.title, summary: item.summary })} className="flex min-h-10 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-medium text-foreground"><Pencil className="h-3.5 w-3.5" aria-hidden="true" />Modifier</button>
                    <button type="button" onClick={() => hideAdvice(item.title)} className="flex min-h-10 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-medium text-muted-foreground"><X className="h-3.5 w-3.5" aria-hidden="true" />Masquer</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <button type="button" onClick={() => setIsAddAdviceOpen(true)} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-care/40 text-sm font-semibold text-care hover:bg-care/5"><Plus className="h-4 w-4" aria-hidden="true" />Ajouter un conseil personnalisé</button>
        </section>

        <aside className="h-fit rounded-3xl border border-[#C9DCF3] bg-[#F5F9FF] p-5 shadow-sm lg:sticky lg:top-8" aria-labelledby="preview-title">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-care">Aperçu patient</p>
          <h2 id="preview-title" className="mt-2 text-xl font-semibold text-foreground">À faire maintenant</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Voici ce que le patient verra après avoir scanné votre QR code.</p>
          <div className="mt-5 rounded-2xl border border-border bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-care">{advice.length} conseils transmis</p>
            <div className="mt-3 flex flex-col divide-y divide-border">
              {advice.map((item) => <div key={item.title} className="flex gap-3 py-3 first:pt-0 last:pb-0"><span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E5F6EE] text-care"><Check className="h-4 w-4" aria-hidden="true" /></span><p className="text-sm font-medium leading-5 text-foreground">{item.title}</p></div>)}
            </div>
          </div>
          {recommendedProfessional[selectedCondition.id] ? <div className="mt-4 rounded-xl border border-[#C9DCF3] bg-white p-3 text-sm leading-5 text-foreground"><p className="text-xs font-semibold uppercase tracking-wide text-care">Orientation transmise</p><p className="mt-1">À voir ensuite : <strong>{recommendedProfessional[selectedCondition.id]}</strong></p><p className="mt-1 text-xs text-muted-foreground">Le patient reste libre de choisir son professionnel. Cette orientation ne remplace pas votre évaluation clinique.</p></div> : null}
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-white/70 p-3 text-xs leading-5 text-muted-foreground"><Check className="mt-0.5 h-4 w-4 shrink-0 text-care" aria-hidden="true" />Vous gardez la main : ces conseils seront transmis uniquement après votre partage du parcours.</div>
          {isReferralSaved[selectedCondition.id] ? <p className="mt-3 text-sm font-medium text-care" role="status">Orientation enregistrée pour l’aperçu de ce parcours.</p> : null}
        </aside>
      </div>

      {editingAdvice ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101C33]/35 p-4" role="presentation">
          <form onSubmit={saveAdviceEdit} className="w-full max-w-lg rounded-3xl border border-border bg-card p-5 shadow-xl sm:p-6" aria-labelledby="edit-advice-title">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-care">{selectedCondition.name}</p><h2 id="edit-advice-title" className="mt-1 text-xl font-semibold text-foreground">Modifier le conseil</h2></div><button type="button" onClick={() => setEditingAdvice(null)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Fermer"><X className="h-5 w-5" aria-hidden="true" /></button></div>
            <div className="mt-5 space-y-4"><label className="block text-sm font-medium text-foreground">Titre<input required value={editingAdvice.title} onChange={(event) => setEditingAdvice((current) => current ? { ...current, title: event.target.value } : current)} className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm" /></label><label className="block text-sm font-medium text-foreground">Consigne<textarea required value={editingAdvice.summary} onChange={(event) => setEditingAdvice((current) => current ? { ...current, summary: event.target.value } : current)} className="mt-1.5 min-h-28 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm" /></label></div>
            <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setEditingAdvice(null)} className="min-h-11 rounded-xl border border-border px-4 text-sm font-semibold">Annuler</button><button type="submit" className="min-h-11 rounded-xl bg-care px-4 text-sm font-semibold text-care-foreground">Enregistrer</button></div>
          </form>
        </div>
      ) : null}

      {isAddAdviceOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101C33]/35 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsAddAdviceOpen(false); }}>
          <form onSubmit={addAdvice} className="w-full max-w-lg rounded-3xl border border-border bg-card p-5 shadow-xl sm:p-6" aria-labelledby="add-advice-title">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-semibold uppercase tracking-wide text-care">{selectedCondition.name}</p><h2 id="add-advice-title" className="mt-1 text-xl font-semibold text-foreground">Ajouter un conseil</h2><p className="mt-1 text-sm text-muted-foreground">Ce conseil sera préparé pour ce parcours.</p></div>
              <button type="button" onClick={() => setIsAddAdviceOpen(false)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Fermer"><X className="h-5 w-5" aria-hidden="true" /></button>
            </div>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-foreground">Titre<input required value={newAdviceTitle} onChange={(event) => setNewAdviceTitle(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-care focus:ring-2 focus:ring-care/20" placeholder="Ex. Mettre de la glace" /></label>
              <label className="block text-sm font-medium text-foreground">Consigne<textarea required value={newAdviceSummary} onChange={(event) => setNewAdviceSummary(event.target.value)} className="mt-1.5 min-h-28 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:border-care focus:ring-2 focus:ring-care/20" placeholder="Décrivez simplement le geste à faire." /></label>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setIsAddAdviceOpen(false)} className="min-h-11 rounded-xl border border-border px-4 text-sm font-semibold text-foreground">Annuler</button><button type="submit" className="min-h-11 rounded-xl bg-care px-4 text-sm font-semibold text-care-foreground">Ajouter le conseil</button></div>
          </form>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><p className="font-semibold text-foreground">Prêt à transmettre ce parcours ?</p><p className="mt-1 text-sm text-muted-foreground">Vous pourrez toujours modifier ou masquer un conseil plus tard.</p></div><button type="button" onClick={() => { void saveReferral(); }} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-care px-4 text-sm font-semibold text-care-foreground">Enregistrer et continuer<ChevronDown className="h-4 w-4 -rotate-90" aria-hidden="true" /></button></div>
    </DoctorPage>
  );
}
