import { createFileRoute } from "@tanstack/react-router";
import { Check, ChevronDown, GripVertical, Pencil, Plus, X } from "lucide-react";
import { DoctorHeader, DoctorPage } from "@/components/doctor/DoctorLayout";
import { conditions } from "@/lib/conditions";

export const Route = createFileRoute("/cabinet/conseils")({
  head: () => ({ meta: [{ title: "Conseils à appliquer — Kivoir" }] }),
  component: AdviceReviewPage,
});

const advice = [
  { title: "Appliquer du froid", description: "Pendant 15 à 20 minutes, protégé par un linge." },
  { title: "Surélever la zone concernée", description: "Au-dessus du niveau du cœur lorsque vous êtes au repos." },
  { title: "Utiliser une compression adaptée", description: "Si elle vous a été recommandée, sans serrer excessivement." },
  { title: "Reprendre progressivement", description: "Selon les consignes reçues et votre douleur." },
];

function AdviceReviewPage() {
  return (
    <DoctorPage>
      <DoctorHeader
        eyebrow="Contenu transmis au patient"
        title="Conseils à appliquer"
        description="Vérifiez les conseils proposés pour chaque parcours. Vous pouvez les conserver, les masquer ou les adapter sans avoir à tout recréer."
        actions={<button type="button" className="flex min-h-11 items-center gap-2 rounded-xl bg-care px-4 text-sm font-semibold text-care-foreground"><Plus className="h-4 w-4" aria-hidden="true" />Ajouter un conseil</button>}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
        <section className="min-w-0 rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6" aria-labelledby="advice-list-title">
          <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="advice-list-title" className="text-lg font-semibold text-foreground">Les conseils proposés</h2>
              <p className="mt-1 text-sm text-muted-foreground">Parcours sélectionné : <span className="font-medium text-foreground">Entorse de cheville</span></p>
            </div>
            <label className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm text-foreground">
              <span className="sr-only">Choisir un parcours</span>
              <select className="bg-transparent outline-none" defaultValue="entorse-cheville">
                {conditions.slice(0, 4).map((condition) => <option key={condition.id} value={condition.id}>{condition.name}</option>)}
              </select>
            </label>
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
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" className="flex min-h-10 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-medium text-foreground"><Pencil className="h-3.5 w-3.5" aria-hidden="true" />Modifier</button>
                    <button type="button" className="flex min-h-10 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-medium text-muted-foreground"><X className="h-3.5 w-3.5" aria-hidden="true" />Masquer</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <button type="button" className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-care/40 text-sm font-semibold text-care hover:bg-care/5"><Plus className="h-4 w-4" aria-hidden="true" />Ajouter un conseil personnalisé</button>
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
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-white/70 p-3 text-xs leading-5 text-muted-foreground"><Check className="mt-0.5 h-4 w-4 shrink-0 text-care" aria-hidden="true" />Vous gardez la main : ces conseils seront transmis uniquement après votre partage du parcours.</div>
        </aside>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><p className="font-semibold text-foreground">Prêt à transmettre ce parcours ?</p><p className="mt-1 text-sm text-muted-foreground">Vous pourrez toujours modifier ou masquer un conseil plus tard.</p></div><button type="button" className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-care px-4 text-sm font-semibold text-care-foreground">Enregistrer et continuer<ChevronDown className="h-4 w-4 -rotate-90" aria-hidden="true" /></button></div>
    </DoctorPage>
  );
}
