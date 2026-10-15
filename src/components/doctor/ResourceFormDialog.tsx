import { useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { conditions } from "@/lib/conditions";
import { resourceKind, resourceKindLabels, type ResourceKind } from "@/lib/doctor-pathway-info";
import type { DoctorResourceRecord } from "@/lib/doctor-resource-db";
import { SaveStatus, type SaveState } from "@/components/doctor/states";
import { sendJson } from "@/components/doctor/use-doctor-data";

const field = "mt-1 min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

export function ResourceFormDialog({ open, onOpenChange, resource, onSaved }: { open: boolean; onOpenChange: (open: boolean) => void; resource: DoctorResourceRecord | null; onSaved: () => Promise<void> }) {
  const editing = Boolean(resource);
  const [kind, setKind] = useState<ResourceKind>(resource ? resourceKind(resource) : "document");
  const [mode, setMode] = useState<"file" | "link">("file");
  const [state, setState] = useState<SaveState>({ status: "idle" });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const conditionId = String(form.get("conditionId") ?? "");
    if (!title) return setState({ status: "error", message: "Le titre affiché au patient est obligatoire." });
    if (!conditionId) return setState({ status: "error", message: "Choisissez un parcours." });
    const common = {
      title,
      conditionId,
      source: String(form.get("source") ?? "").trim(),
      description: String(form.get("description") ?? "").trim(),
      validatedAt: String(form.get("validatedAt") ?? ""),
      status: form.get("status") === "hidden" ? "hidden" : "active",
      kind,
    };
    setState({ status: "saving" });
    try {
      if (resource) {
        await sendJson("/api/doctor-resources", "PATCH", { id: resource.id, ...common });
      } else if (mode === "file") {
        const file = form.get("file");
        if (!(file instanceof File) || file.size === 0) return setState({ status: "error", message: "Sélectionnez un fichier." });
        const upload = new FormData();
        upload.set("file", file);
        Object.entries(common).forEach(([key, value]) => upload.set(key, value));
        if (!common.source) upload.set("source", "Fichier partagé par le médecin");
        const response = await fetch("/api/doctor-file", { method: "POST", body: upload });
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        if (!response.ok) throw new Error(data.error ?? "L’envoi du fichier a échoué.");
      } else {
        const url = String(form.get("url") ?? "").trim();
        if (!/^https?:\/\//i.test(url)) return setState({ status: "error", message: "Saisissez un lien commençant par https://" });
        await sendJson("/api/doctor-resources", "POST", { ...common, url, source: common.source || "Lien partagé par le médecin" });
      }
      await onSaved();
      setState({ status: "saved", message: editing ? "Ressource mise à jour." : "Ressource ajoutée." });
      window.setTimeout(() => onOpenChange(false), 700);
    } catch (cause) {
      setState({ status: "error", message: cause instanceof Error ? cause.message : "L’enregistrement a échoué." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Modifier la ressource" : "Ajouter une ressource"}</DialogTitle>
          <DialogDescription>Le patient retrouvera cette ressource dans son parcours.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-4">
          <label className="text-sm font-medium">Titre affiché au patient
            <input name="title" required maxLength={200} defaultValue={resource?.title ?? ""} className={field} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">Type
              <select value={kind} onChange={(event) => setKind(event.target.value as ResourceKind)} className={field}>
                {(Object.keys(resourceKindLabels) as ResourceKind[]).map((key) => <option key={key} value={key}>{resourceKindLabels[key]}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium">Parcours
              <select name="conditionId" required defaultValue={resource?.conditionId ?? ""} className={field}>
                <option value="" disabled>Choisir…</option>
                {conditions.map((condition) => <option key={condition.id} value={condition.id}>{condition.name}</option>)}
              </select>
            </label>
          </div>
          {!editing ? (
            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium">Contenu</legend>
              <div className="grid grid-cols-2 gap-2" role="radiogroup">
                {(["file", "link"] as const).map((value) => (
                  <button key={value} type="button" role="radio" aria-checked={mode === value} onClick={() => setMode(value)} className={`min-h-11 rounded-xl border text-sm font-medium ${mode === value ? "border-care bg-care/10 text-care" : "border-border"}`}>
                    {value === "file" ? "Fichier" : "Lien"}
                  </button>
                ))}
              </div>
              {mode === "file" ? (
                <input name="file" type="file" accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,.webp,.mp4,.mov,.m4v" className="text-sm file:mr-3 file:min-h-10 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:font-medium" />
              ) : (
                <input name="url" type="url" inputMode="url" placeholder="https://" className={field} />
              )}
              <p className="text-xs text-muted-foreground">PDF, images ou vidéos, 50 Mo maximum.</p>
            </fieldset>
          ) : null}
          <label className="text-sm font-medium">Description courte <span className="font-normal text-muted-foreground">(facultatif)</span>
            <textarea name="description" rows={2} maxLength={500} defaultValue={resource?.description ?? ""} className={`${field} py-2`} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">Source
              <input name="source" maxLength={200} defaultValue={resource?.source ?? ""} className={field} />
            </label>
            <label className="text-sm font-medium">Date de validation
              <input name="validatedAt" type="date" defaultValue={resource?.validatedAt ?? ""} className={field} />
            </label>
          </div>
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input name="status" type="checkbox" value="hidden" defaultChecked={resource?.status === "hidden"} className="h-4 w-4" />
            Masquer pour l’instant aux patients
          </label>
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
