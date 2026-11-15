import { useId, useRef, useState, type FormEvent } from "react";
import { put as putBlob } from "@vercel/blob/client";
import { BookOpen, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { conditions } from "@/lib/conditions";
import {
  resourceKind,
  resourceKindLabels,
  selectableResourceKinds,
  kineSelectableResourceKinds,
  type ResourceKind,
} from "@/lib/doctor-pathway-info";
import type { DoctorResourceRecord } from "@/lib/doctor-resource-db";
import { SaveStatus, type SaveState } from "@/components/doctor/states";
import { sendJson } from "@/components/doctor/use-doctor-data";

const field =
  "mt-1 min-h-11 w-full rounded-xl border border-[#d4e2d9] bg-white px-3 text-sm outline-none transition focus:border-[#177e78] focus:ring-2 focus:ring-[#177e78]/20";

const uploadAcceptByKind: Partial<Record<ResourceKind, string>> = {
  video: ".mp4,.mov,.m4v,.webm,video/mp4,video/quicktime,video/x-m4v,video/webm",
  document: ".pdf,application/pdf",
  photo: ".jpg,.jpeg,.png,.heic,.heif,.webp,image/*",
  audio: ".mp3,.wav,.m4a,.aac,.ogg,audio/mpeg,audio/wav,audio/mp4,audio/aac,audio/ogg",
};

export function ResourceFormDialog({
  open,
  onOpenChange,
  resource,
  onSaved,
  defaultSource,
  defaultConditionId,
  simplifiedKineForm = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: DoctorResourceRecord | null;
  onSaved: () => Promise<void>;
  defaultSource?: string;
  defaultConditionId?: string | undefined;
  simplifiedKineForm?: boolean;
}) {
  const editing = Boolean(resource);
  const formId = useId();
  const [kind, setKind] = useState<ResourceKind>(resource ? resourceKind(resource) : "document");
  const [mode, setMode] = useState<"file" | "link">("file");
  const [state, setState] = useState<SaveState>({ status: "idle" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogTitleRef = useRef<HTMLHeadingElement>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [videoPrivacyConfirmed, setVideoPrivacyConfirmed] = useState(false);
  const availableKinds = simplifiedKineForm ? kineSelectableResourceKinds : selectableResourceKinds;
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setVideoPrivacyConfirmed(false);
      setSelectedFileName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    onOpenChange(nextOpen);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const conditionId = String(form.get("conditionId") ?? "");
    if (simplifiedKineForm && !conditionId)
      return setState({ status: "error", message: "Choisissez un parcours." });
    if (!title)
      return setState({ status: "error", message: "Le titre affiché au patient est obligatoire." });
    if (!conditionId) return setState({ status: "error", message: "Choisissez un parcours." });
    if (!resource && mode === "file" && kind === "video" && !videoPrivacyConfirmed) {
      return setState({
        status: "error",
        message:
          "La bibliothèque est réservée aux vidéos de démonstration du kiné, sans patient identifiable.",
      });
    }
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
        if (!(file instanceof File) || file.size === 0)
          return setState({ status: "error", message: "Sélectionnez un fichier." });
        const tokenResponse = await fetch("/api/doctor-file-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        });
        const tokenData = (await tokenResponse.json().catch(() => ({}))) as {
          error?: string;
          token?: string;
          pathname?: string;
        };
        if (!tokenResponse.ok || !tokenData.token || !tokenData.pathname) {
          throw new Error(tokenData.error ?? "Impossible de préparer l’envoi du fichier.");
        }

        const blob = await putBlob(tokenData.pathname, file, {
          access: "public",
          token: tokenData.token,
          multipart: file.size > 5 * 1024 * 1024,
          ...(file.type ? { contentType: file.type } : {}),
        });
        const response = await fetch("/api/doctor-resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...common,
            url: blob.url,
            filename: file.name,
            contentType: blob.contentType || file.type,
            source: common.source || defaultSource || "Fichier partagé par le médecin",
          }),
        });
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        if (!response.ok)
          throw new Error(
            data.error ?? "La vidéo a été envoyée, mais pas ajoutée à la bibliothèque.",
          );
      } else {
        const url = String(form.get("url") ?? "").trim();
        if (!/^https?:\/\//i.test(url))
          return setState({
            status: "error",
            message: "Saisissez un lien commençant par https://",
          });
        await sendJson("/api/doctor-resources", "POST", {
          ...common,
          url,
          source: common.source || defaultSource || "Lien partagé par le médecin",
        });
      }
      await onSaved();
      setState({
        status: "saved",
        message: editing ? "Ressource mise à jour." : "Ressource ajoutée.",
      });
      window.setTimeout(() => handleOpenChange(false), 700);
    } catch (cause) {
      setState({
        status: "error",
        message: cause instanceof Error ? cause.message : "L’enregistrement a échoué.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[90dvh] overflow-y-auto sm:max-w-lg",
          simplifiedKineForm &&
            "fixed inset-x-0 bottom-0 left-0 top-auto z-50 flex max-h-[min(92dvh,56rem)] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-t-[2rem] border border-[#cfe2d5] bg-[#eaf4ed] p-0 text-[#19392f] shadow-[0_-12px_44px_rgba(25,57,47,0.18)] sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[90dvh] sm:max-w-xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-[1.75rem]",
        )}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          dialogTitleRef.current?.focus();
        }}
      >
        <DialogHeader
          className={cn(
            simplifiedKineForm &&
              "shrink-0 space-y-0 border-b border-[#cfe2d5] bg-[#eaf4ed] px-5 pb-4 pt-4 text-left sm:px-6 sm:pt-5",
          )}
        >
          {simplifiedKineForm ? (
            <>
              <div className="mb-3 flex justify-center sm:hidden" aria-hidden="true">
                <span className="h-1.5 w-10 rounded-full bg-[#bdd3c4]" />
              </div>
              <div className="flex items-start gap-3 pr-8">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#176b5b] ring-1 ring-[#d4e2d9]">
                  <BookOpen className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[#177e78]">
                    Bibliothèque de soins
                  </p>
                  <DialogTitle
                    ref={dialogTitleRef}
                    tabIndex={-1}
                    className="text-xl font-bold tracking-tight text-[#19392f] sm:text-2xl"
                  >
                    {editing ? "Modifier la ressource" : "Ajouter une ressource"}
                  </DialogTitle>
                  <DialogDescription className="mt-1 max-w-md text-sm leading-5 text-[#587269]">
                    Choisissez le parcours et le type de contenu à partager.
                  </DialogDescription>
                </div>
              </div>
            </>
          ) : (
            <>
              <DialogTitle ref={dialogTitleRef} tabIndex={-1}>
                {editing ? "Modifier la ressource" : "Ajouter une ressource"}
              </DialogTitle>
              <DialogDescription>
                Le patient retrouvera cette ressource dans son parcours.
              </DialogDescription>
            </>
          )}
        </DialogHeader>
        <form
          id={formId}
          onSubmit={(event) => void submit(event)}
          className={cn(
            "flex flex-col gap-4",
            simplifiedKineForm &&
              "min-h-0 flex-1 overflow-y-auto px-5 py-5 pb-4 text-[#19392f] sm:px-6 sm:py-6",
          )}
        >
          {simplifiedKineForm ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-[#355c4e]">
                  Parcours
                  <select
                    name="conditionId"
                    required
                    defaultValue={resource?.conditionId ?? defaultConditionId ?? ""}
                    className={field}
                  >
                    <option value="" disabled>
                      Choisir…
                    </option>
                    {conditions.map((condition) => (
                      <option key={condition.id} value={condition.id}>
                        {condition.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold text-[#355c4e]">
                  Type
                  <select
                    value={kind}
                    onChange={(event) => {
                      const nextKind = event.target.value as ResourceKind;
                      setKind(nextKind);
                      setMode(nextKind === "link" ? "link" : "file");
                      setSelectedFileName("");
                      setVideoPrivacyConfirmed(false);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className={field}
                  >
                    {!availableKinds.includes(kind) ? (
                      <option value={kind}>{resourceKindLabels[kind]}</option>
                    ) : null}
                    {availableKinds.map((key) => (
                      <option key={key} value={key}>
                        {resourceKindLabels[key]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {!editing ? (
                <fieldset className="flex flex-col gap-3 rounded-2xl border border-[#cfe2d5] bg-white/70 p-4">
                  <legend className="px-1 text-xs font-bold uppercase tracking-[0.14em] text-[#587269]">
                    Contenu à partager
                  </legend>
                  {kind === "link" ? (
                    <label className="text-sm font-semibold text-[#355c4e]">
                      Lien vers la ressource
                      <input
                        name="url"
                        type="url"
                        inputMode="url"
                        required
                        placeholder="https://"
                        className={field}
                      />
                    </label>
                  ) : (
                    <>
                      <input
                        ref={fileInputRef}
                        name="file"
                        type="file"
                        accept={uploadAcceptByKind[kind] ?? uploadAcceptByKind.document}
                        tabIndex={-1}
                        aria-hidden="true"
                        className="sr-only"
                        onChange={(event) => {
                          const file = event.currentTarget.files?.[0];
                          if (file) {
                            setSelectedFileName(file.name);

                            setVideoPrivacyConfirmed(false);
                          }
                        }}
                      />
                      <div className="rounded-xl bg-[#eaf4ed] p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#177e78] ring-1 ring-[#d4e2d9]">
                            <Upload className="size-5" aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <p
                              aria-live="polite"
                              className="truncate text-sm font-semibold text-[#19392f]"
                            >
                              {selectedFileName || "Aucun fichier sélectionné"}
                            </p>
                            <p className="mt-1 text-xs text-[#668075]">
                              {kind === "video"
                                ? "MP4, MOV, M4V ou WEBM · 50 Mo maximum"
                                : kind === "photo"
                                  ? "JPG, PNG, HEIC ou WEBP · 50 Mo maximum"
                                  : kind === "audio"
                                    ? "MP3, WAV, M4A, AAC ou OGG · 50 Mo maximum"
                                    : "PDF · 50 Mo maximum"}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-4 min-h-11 w-full rounded-xl bg-tone-green-border px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-tone-green-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tone-green-border focus-visible:ring-offset-2 sm:w-auto"
                        >
                          {selectedFileName ? "Changer de fichier" : "Choisir un fichier"}
                        </button>
                      </div>
                      {kind === "video" ? (
                        <label
                          htmlFor={`video-privacy-confirmed-${formId}`}
                          className="flex items-start gap-3 rounded-xl border border-[#d4e2d9] bg-[#f3f8f4] p-3 text-sm text-[#355c4e]"
                        >
                          <Checkbox
                            id={`video-privacy-confirmed-${formId}`}
                            checked={videoPrivacyConfirmed}
                            onCheckedChange={(checked) =>
                              setVideoPrivacyConfirmed(checked === true)
                            }
                          />
                          <span>
                            Je confirme qu’il s’agit d’une démonstration du kiné, sans patient
                            identifiable.
                          </span>
                        </label>
                      ) : null}
                    </>
                  )}
                </fieldset>
              ) : null}
            </>
          ) : (
            <>
              <label
                className={cn(
                  "text-sm font-medium",
                  simplifiedKineForm && "font-semibold text-[#355c4e]",
                )}
              >
                Titre affiché au patient
                <input
                  name="title"
                  required
                  maxLength={200}
                  defaultValue={resource?.title ?? ""}
                  className={field}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium">
                  Type
                  <select
                    value={kind}
                    onChange={(event) => {
                      setKind(event.target.value as ResourceKind);
                      setVideoPrivacyConfirmed(false);
                    }}
                    className={field}
                  >
                    {!availableKinds.includes(kind) ? (
                      <option value={kind}>{resourceKindLabels[kind]}</option>
                    ) : null}
                    {availableKinds.map((key) => (
                      <option key={key} value={key}>
                        {resourceKindLabels[key]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium">
                  Parcours
                  <select
                    name="conditionId"
                    required
                    defaultValue={resource?.conditionId ?? defaultConditionId ?? ""}
                    className={field}
                  >
                    <option value="" disabled>
                      Choisir…
                    </option>
                    {conditions.map((condition) => (
                      <option key={condition.id} value={condition.id}>
                        {condition.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {!editing ? (
                <fieldset className="flex flex-col gap-2">
                  <legend className="text-sm font-medium">Contenu</legend>
                  <div className="grid grid-cols-2 gap-2" role="radiogroup">
                    {(["file", "link"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={mode === value}
                        onClick={() => {
                          setMode(value);
                          setVideoPrivacyConfirmed(false);
                        }}
                        className={`min-h-11 rounded-xl border text-sm font-medium ${mode === value ? "border-care bg-care/10 text-care" : "border-border"}`}
                      >
                        {value === "file" ? "Fichier" : "Lien"}
                      </button>
                    ))}
                  </div>
                  {mode === "file" ? (
                    <input
                      name="file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,.webp,.mp4,.mov,.m4v,.webm"
                      onChange={() => setVideoPrivacyConfirmed(false)}
                      className="text-sm file:mr-3 file:min-h-10 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:font-medium"
                    />
                  ) : (
                    <input
                      name="url"
                      type="url"
                      inputMode="url"
                      placeholder="https://"
                      className={field}
                    />
                  )}
                  <p className="text-xs text-muted-foreground">
                    PDF, images ou vidéos, 50 Mo maximum.
                  </p>
                  {!editing && mode === "file" && kind === "video" ? (
                    <label
                      htmlFor={`video-privacy-confirmed-${formId}`}
                      className="flex items-start gap-3 rounded-xl border border-border p-3 text-sm"
                    >
                      <Checkbox
                        id={`video-privacy-confirmed-${formId}`}
                        checked={videoPrivacyConfirmed}
                        onCheckedChange={(checked) => setVideoPrivacyConfirmed(checked === true)}
                      />
                      <span>
                        Je confirme qu’il s’agit d’une démonstration du kiné, sans patient
                        identifiable.
                      </span>
                    </label>
                  ) : null}
                </fieldset>
              ) : null}
            </>
          )}
          <section
            className={cn(
              simplifiedKineForm && "rounded-2xl border border-[#cfe2d5] bg-white/70 p-4",
            )}
          >
            {simplifiedKineForm ? (
              <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#587269]">
                Détails et partage
              </h3>
            ) : null}
            <div className="flex flex-col gap-4">
              {simplifiedKineForm ? (
                <label className="text-sm font-semibold text-[#355c4e]">
                  Titre affiché au patient
                  <input
                    name="title"
                    required
                    maxLength={200}
                    defaultValue={resource?.title ?? ""}
                    className={field}
                  />
                </label>
              ) : null}
              <label
                className={cn(
                  "text-sm font-medium",
                  simplifiedKineForm && "font-semibold text-[#355c4e]",
                )}
              >
                Description courte{" "}
                <span
                  className={cn(
                    "font-normal",
                    simplifiedKineForm ? "text-[#668075]" : "text-muted-foreground",
                  )}
                >
                  (facultatif)
                </span>
                <textarea
                  name="description"
                  rows={2}
                  maxLength={500}
                  defaultValue={resource?.description ?? ""}
                  className={cn(field, "py-2")}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label
                  className={cn(
                    "text-sm font-medium",
                    simplifiedKineForm && "font-semibold text-[#355c4e]",
                  )}
                >
                  Source
                  <input
                    name="source"
                    maxLength={200}
                    defaultValue={resource?.source ?? defaultSource ?? ""}
                    className={field}
                  />
                </label>
                <label
                  className={cn(
                    "text-sm font-medium",
                    simplifiedKineForm && "font-semibold text-[#355c4e]",
                  )}
                >
                  Date de validation
                  <input
                    name="validatedAt"
                    type="date"
                    defaultValue={resource?.validatedAt ?? ""}
                    className={field}
                  />
                </label>
              </div>
              <label
                className={cn(
                  "flex min-h-11 items-center gap-3 text-sm",
                  simplifiedKineForm &&
                    "rounded-xl border border-[#d4e2d9] bg-[#f3f8f4] p-3 text-[#19392f]",
                )}
              >
                <input
                  name="status"
                  type="checkbox"
                  value="hidden"
                  defaultChecked={resource?.status === "hidden"}
                  className={cn("h-4 w-4", simplifiedKineForm && "accent-[#177e78]")}
                />
                <span className="font-medium">Masquer pour l’instant aux patients</span>
              </label>
            </div>
          </section>
        </form>
        <div
          className={cn(
            "shrink-0",
            simplifiedKineForm
              ? "border-t border-[#cfe2d5] bg-[#f3f8f4] px-5 py-4 sm:px-6"
              : "pt-2",
          )}
        >
          <SaveStatus state={state} />
          <div className="mt-3 flex gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className={cn(
                "min-h-11 flex-1 rounded-xl border px-4 text-sm font-medium transition-colors sm:flex-none",
                simplifiedKineForm
                  ? "border-[#d4e2d9] bg-white text-[#355c4e] hover:bg-[#fafbfa]"
                  : "border-border hover:bg-muted",
              )}
            >
              Annuler
            </button>
            <button
              type="submit"
              form={formId}
              disabled={state.status === "saving"}
              className="min-h-11 flex-1 rounded-xl bg-tone-green-border px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-tone-green-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tone-green-border focus-visible:ring-offset-2 disabled:opacity-60 sm:flex-none"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
