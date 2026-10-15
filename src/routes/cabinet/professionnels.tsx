import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Mail, MapPin, Pencil, Phone, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DoctorHeader, DoctorPage } from "@/components/doctor/DoctorLayout";
import { EmptyState, ErrorState, LoadingState, SaveStatus, type SaveState } from "@/components/doctor/states";
import { ConfirmationDialog } from "@/components/doctor/ConfirmationDialog";
import { doctorKeys, sendJson, useDoctorCache, useDoctorNetwork, type Practitioner } from "@/components/doctor/use-doctor-data";

export const Route = createFileRoute("/cabinet/professionnels")({
  head: () => ({ meta: [{ title: "Professionnels recommandés — Kivoir" }] }),
  component: ProfessionalsPage,
});

const field = "mt-1 min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";
const iconButton = "flex h-11 w-11 items-center justify-center rounded-xl border border-border hover:bg-muted";

function ProfessionalsPage() {
  const network = useDoctorNetwork();
  const cache = useDoctorCache();
  const [form, setForm] = useState<{ open: boolean; item: Practitioner | null; key: number }>({ open: false, item: null, key: 0 });
  const [toDelete, setToDelete] = useState<Practitioner | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfession, setSelectedProfession] = useState("Toutes les spécialités");

  const refresh = () => cache.invalidateQueries({ queryKey: doctorKeys.network });
  const openForm = (item: Practitioner | null) => setForm((current) => ({ open: true, item, key: current.key + 1 }));

  const run = async (action: () => Promise<unknown>) => {
    setError(null);
    try {
      await action();
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "La modification a échoué.");
    }
  };

  const practitioners = network.data?.practitioners ?? [];
  const professions = Array.from(new Set(practitioners.map((item) => item.profession.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, "fr"));
  const filteredPractitioners = selectedProfession === "Toutes les spécialités"
    ? practitioners
    : practitioners.filter((item) => item.profession === selectedProfession);
  const canAdd = Boolean(network.data);

  return (
    <DoctorPage>
      <DoctorHeader
        title="Professionnels recommandés"
        description="Les professionnels que vos patients verront dans leur parcours."
        actions={canAdd ? <button type="button" onClick={() => openForm(null)} className="flex min-h-11 items-center gap-2 rounded-xl bg-care px-4 text-sm font-semibold text-care-foreground"><Plus className="h-4 w-4" aria-hidden="true" />Ajouter un professionnel</button> : undefined}
      />
      <div className="mt-6 flex flex-col gap-3">
        {error ? <ErrorState message={error} /> : null}
        {network.data && practitioners.length > 0 ? (
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <label htmlFor="profession-filter" className="text-sm font-semibold text-foreground">Rechercher par spécialité</label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
              <select
                id="profession-filter"
                value={selectedProfession}
                onChange={(event) => setSelectedProfession(event.target.value)}
                className="min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-ring sm:max-w-sm"
              >
                <option>Toutes les spécialités</option>
                {professions.map((profession) => <option key={profession}>{profession}</option>)}
              </select>
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {filteredPractitioners.length} professionnel{filteredPractitioners.length > 1 ? "s" : ""} affiché{filteredPractitioners.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        ) : null}
        {network.isPending ? (
          <LoadingState label="Chargement de vos professionnels…" />
        ) : network.isError ? (
          <ErrorState message="Impossible de charger vos professionnels." onRetry={() => void network.refetch()} />
        ) : !network.data ? (
          <EmptyState title="Renseignez d’abord votre cabinet" description="Les professionnels sont rattachés à votre cabinet. Indiquez son nom et son adresse pour commencer." action={<Link to="/cabinet/mon-cabinet" className="inline-flex min-h-11 items-center rounded-xl bg-care px-4 text-sm font-semibold text-care-foreground">Renseigner mon cabinet</Link>} />
        ) : !practitioners.length ? (
          <EmptyState title="Aucun professionnel recommandé" description="Ajoutez un kinésithérapeute, un podologue ou tout autre confrère." action={<button type="button" onClick={() => openForm(null)} className="min-h-11 rounded-xl bg-care px-4 text-sm font-semibold text-care-foreground">Ajouter un professionnel</button>} />
        ) : (
          <ul className="flex max-w-3xl flex-col gap-3">
            {filteredPractitioners.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">
                Aucun professionnel n&apos;est enregistré pour cette spécialité.
              </li>
            ) : null}
            {filteredPractitioners.map((item) => (
              <li key={item.id} className={`flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm ${item.hidden ? "border-dashed opacity-75" : "border-border"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-sm text-care">{item.profession}</p>
                  </div>
                  {item.hidden ? <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Masqué</span> : null}
                </div>
                <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                  {item.phone ? <li className="flex items-center gap-2"><Phone className="h-4 w-4" aria-hidden="true" />{item.phone}</li> : null}
                  {item.email ? <li className="flex items-center gap-2 break-all"><Mail className="h-4 w-4 shrink-0" aria-hidden="true" />{item.email}</li> : null}
                  {item.address || item.city ? <li className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />{[item.address, [item.postalCode, item.city].filter(Boolean).join(" ")].filter(Boolean).join(", ")}</li> : null}
                </ul>
                <div className="mt-auto flex gap-1">
                  <button type="button" onClick={() => openForm(item)} aria-label={`Modifier ${item.name}`} className={iconButton}><Pencil className="h-4 w-4" aria-hidden="true" /></button>
                  <button type="button" onClick={() => void run(() => sendJson("/api/doctor-network", "PATCH", { id: item.id, hidden: !item.hidden }))} aria-label={item.hidden ? `Afficher ${item.name}` : `Masquer ${item.name}`} className={iconButton}>{item.hidden ? <Eye className="h-4 w-4" aria-hidden="true" /> : <EyeOff className="h-4 w-4" aria-hidden="true" />}</button>
                  <button type="button" onClick={() => setToDelete(item)} aria-label={`Supprimer ${item.name}`} className={`${iconButton} text-destructive`}><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {network.data ? (
        <PractitionerDialog key={form.key} open={form.open} onOpenChange={(open) => setForm((current) => ({ ...current, open }))} item={form.item} network={network.data} onSaved={refresh} />
      ) : null}
      <ConfirmationDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Supprimer ce professionnel ?"
        description={`${toDelete?.name ?? ""} ne sera plus proposé à vos patients. Pour le retirer temporairement, préférez « Masquer ».`}
        onConfirm={() => {
          const target = toDelete;
          setToDelete(null);
          if (target) void run(() => sendJson("/api/doctor-network", "DELETE", { practitionerId: target.id }));
        }}
      />
    </DoctorPage>
  );
}

function PractitionerDialog({ open, onOpenChange, item, network, onSaved }: { open: boolean; onOpenChange: (open: boolean) => void; item: Practitioner | null; network: { name: string; address: string; phone: string | null }; onSaved: () => Promise<void> }) {
  const [state, setState] = useState<SaveState>({ status: "idle" });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    if (!data["name"]?.trim() || !data["profession"]?.trim()) return setState({ status: "error", message: "Le nom et la spécialité sont obligatoires." });
    setState({ status: "saving" });
    try {
      if (item) await sendJson("/api/doctor-network", "PATCH", { id: item.id, ...data });
      else await sendJson("/api/doctor-network", "POST", { name: network.name, address: network.address, phone: network.phone ?? undefined, practitioners: [data] });
      await onSaved();
      setState({ status: "saved", message: item ? "Professionnel mis à jour." : "Professionnel ajouté." });
      window.setTimeout(() => onOpenChange(false), 700);
    } catch (cause) {
      setState({ status: "error", message: cause instanceof Error ? cause.message : "L’enregistrement a échoué." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? "Modifier le professionnel" : "Ajouter un professionnel"}</DialogTitle>
          <DialogDescription>Ces coordonnées seront visibles par vos patients.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">Nom<input name="name" required defaultValue={item?.name ?? ""} autoComplete="name" className={field} /></label>
            <label className="text-sm font-medium">Spécialité<input name="profession" required defaultValue={item?.profession ?? ""} placeholder="Kinésithérapeute" className={field} /></label>
            <label className="text-sm font-medium">Téléphone<input name="phone" type="tel" defaultValue={item?.phone ?? ""} autoComplete="tel" className={field} /></label>
            <label className="text-sm font-medium">E-mail<input name="email" type="email" defaultValue={item?.email ?? ""} autoComplete="email" className={field} /></label>
          </div>
          <label className="text-sm font-medium">Adresse<input name="address" defaultValue={item?.address ?? ""} autoComplete="street-address" className={field} /></label>
          <div className="grid grid-cols-[120px_1fr] gap-4">
            <label className="text-sm font-medium">Code postal<input name="postalCode" inputMode="numeric" defaultValue={item?.postalCode ?? ""} autoComplete="postal-code" className={field} /></label>
            <label className="text-sm font-medium">Ville<input name="city" defaultValue={item?.city ?? ""} autoComplete="address-level2" className={field} /></label>
          </div>
          <SaveStatus state={state} />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => onOpenChange(false)} className="min-h-11 rounded-xl border border-border px-4 text-sm font-medium">Annuler</button>
            <button type="submit" disabled={state.status === "saving"} className="min-h-11 rounded-xl bg-care px-5 text-sm font-semibold text-care-foreground disabled:opacity-60">Enregistrer</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
