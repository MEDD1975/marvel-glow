import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  MapPin,
  Network,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { DirectoryShareTools } from "@/components/DirectoryShareTools";
import { ConfirmationDialog } from "@/components/doctor/ConfirmationDialog";
import {
  useDoctorCache,
  useDoctorNetwork,
  doctorKeys,
  sendJson,
  type Practitioner,
  type DoctorNetwork,
} from "@/components/doctor/use-doctor-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Cabinet, Profession } from "@/lib/directory";

export const Route = createFileRoute("/cabinet/kine/reseau")({
  head: () => ({ meta: [{ title: "Mon réseau professionnel — Kivoir" }] }),
  component: KineNetworkPage,
});

const inputClass =
  "mt-1 min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring";
const iconButtonClass =
  "flex size-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function KineNetworkPage() {
  const network = useDoctorNetwork();
  const cache = useDoctorCache();
  const [editingCabinet, setEditingCabinet] = useState(false);
  const [dialog, setDialog] = useState<{ open: boolean; item: Practitioner | null; key: number }>({
    open: false,
    item: null,
    key: 0,
  });
  const [toDelete, setToDelete] = useState<Practitioner | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const refresh = () => cache.invalidateQueries({ queryKey: doctorKeys.network });
  const practitioners = useMemo(
    () => network.data?.practitioners ?? [],
    [network.data?.practitioners],
  );
  const activePractitioners = useMemo(
    () => practitioners.filter((item) => !item.hidden),
    [practitioners],
  );
  const filteredPractitioners = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fr");
    if (!normalizedQuery) return practitioners;
    return practitioners.filter((item) =>
      `${item.name} ${item.profession} ${item.city ?? ""}`
        .toLocaleLowerCase("fr")
        .includes(normalizedQuery),
    );
  }, [practitioners, query]);

  const shareableCabinet = useMemo<Cabinet | undefined>(() => {
    if (!network.data) return undefined;
    return {
      id: network.data.id,
      name: network.data.name,
      providers: activePractitioners.map((item) => ({
        id: item.id,
        name: item.name,
        profession: item.profession as Profession,
        address: item.address || network.data!.address,
        postalCode: item.postalCode ?? "",
        city: item.city ?? "",
        phone: item.phone ?? undefined,
        formattedPhone: item.phone ?? undefined,
        cabinetId: network.data!.id,
        cabinetName: network.data!.name,
      })),
    };
  }, [activePractitioners, network.data]);

  const openPractitionerDialog = (item: Practitioner | null) => {
    setDialog((current) => ({ open: true, item, key: current.key + 1 }));
  };

  const run = async (action: () => Promise<unknown>) => {
    setError("");
    try {
      await action();
      await refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "La modification n’a pas pu être enregistrée.",
      );
    }
  };

  if (network.isPending) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <p role="status" className="text-sm text-muted-foreground">
          Chargement de votre réseau professionnel…
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-7 px-4 py-7 md:px-8 md:py-10">
      <Link
        to="/cabinet/kine"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Retour à l’espace kiné
      </Link>

      <header className="relative overflow-hidden rounded-[2rem] border border-[#d8e9df] bg-gradient-to-br from-[#f0f8f3] via-white to-[#e5f2e9] p-6 shadow-sm md:p-9">
        <div
          className="pointer-events-none absolute -right-14 -top-20 size-64 rounded-full bg-[#d5eadc]/70 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#cfe1d5] bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#315a4c]">
              <Network className="size-3.5" aria-hidden="true" /> Espace kinésithérapeute
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#17382f] md:text-4xl">
              Mon réseau professionnel
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#5d7469] md:text-base">
              Orientez vos patients vers des professionnels de confiance et partagez leurs
              coordonnées au bon moment.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <div className="min-w-32 rounded-2xl border border-white/80 bg-white/85 px-4 py-3 shadow-sm">
              <p className="text-2xl font-bold text-[#17382f]">{activePractitioners.length}</p>
              <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                recommandation{activePractitioners.length === 1 ? "" : "s"} visible
                {activePractitioners.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="min-w-32 rounded-2xl border border-white/80 bg-white/85 px-4 py-3 shadow-sm">
              <p className="text-2xl font-bold text-[#17382f]">
                {practitioners.length - activePractitioners.length}
              </p>
              <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                professionnel{practitioners.length - activePractitioners.length === 1 ? "" : "s"}{" "}
                masqué{practitioners.length - activePractitioners.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
      {network.isError ? (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm" role="alert">
          <h2 className="font-semibold text-foreground">Votre réseau n’a pas pu être chargé</h2>
          <p className="mt-1 text-sm text-muted-foreground">Vos données n’ont pas été modifiées.</p>
          <button
            type="button"
            onClick={() => void network.refetch()}
            className="mt-4 min-h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Réessayer
          </button>
        </section>
      ) : null}

      {!network.isError && (!network.data || editingCabinet) ? (
        <CabinetProfileForm
          key={`${network.data?.id ?? "new"}-${network.data?.name ?? ""}`}
          network={network.data ?? null}
          onSaved={async () => {
            await refresh();
            setEditingCabinet(false);
          }}
          onCancel={network.data ? () => setEditingCabinet(false) : undefined}
        />
      ) : network.data ? (
        <section
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          aria-labelledby="cabinet-profile-title"
        >
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f4ec] text-[#177e78]">
              <MapPin className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="cabinet-profile-title" className="font-semibold text-foreground">
                  {network.data.name}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#e7f4ec] px-2.5 py-1 text-xs font-semibold text-[#287457]">
                  <ShieldCheck className="size-3.5" aria-hidden="true" /> Cabinet renseigné
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{network.data.address}</p>
              {network.data.phone ? (
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="size-3.5" aria-hidden="true" />
                  {network.data.phone}
                </p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditingCabinet(true)}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            <Pencil className="size-4" aria-hidden="true" /> Modifier le cabinet
          </button>
        </section>
      ) : null}

      {network.data ? (
        <>
          <section
            className="overflow-hidden rounded-2xl border border-[#d6e8dc] bg-[#f6faf7] p-5 sm:p-6"
            aria-labelledby="patient-access-title"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#177e78]">
                  Côté patient
                </p>
                <h2 id="patient-access-title" className="mt-1 text-lg font-bold text-[#17382f]">
                  Un annuaire simple à consulter
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#5d7469]">
                  Seuls les professionnels affichés ci-dessous sont visibles. Le patient peut
                  retrouver les coordonnées sans compte Kivoir.
                </p>
              </div>
              <Link
                to="/annuaire"
                search={{ cabinet: network.data.id }}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#177e78] px-4 text-sm font-semibold text-white transition hover:bg-[#126b66]"
              >
                Prévisualiser l’annuaire <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            {shareableCabinet && activePractitioners.length > 0 ? (
              <DirectoryShareTools cabinet={shareableCabinet} />
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-[#cadfd1] bg-white/70 p-4 text-sm text-[#5d7469]">
                Ajoutez un professionnel et rendez-le visible pour activer le partage par QR code,
                SMS ou email.
              </p>
            )}
          </section>

          <section className="space-y-4" aria-labelledby="professionals-title">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#177e78]">
                  Votre sélection
                </p>
                <h2
                  id="professionals-title"
                  className="mt-1 text-xl font-bold tracking-tight text-foreground"
                >
                  Professionnels recommandés
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Vous gardez la main sur les fiches visibles par vos patients.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openPractitionerDialog(null)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#177e78] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#126b66]"
              >
                <Plus className="size-4" aria-hidden="true" /> Ajouter un professionnel
              </button>
            </div>

            {practitioners.length > 0 ? (
              <div className="relative max-w-md">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="Rechercher dans mon réseau"
                  placeholder="Nom, spécialité ou ville"
                  className="min-h-11 pl-9"
                />
              </div>
            ) : null}

            {!practitioners.length ? (
              <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center">
                <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#e8f4ec] text-[#177e78]">
                  <Users className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-semibold text-foreground">Votre réseau commence ici</h3>
                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
                  Ajoutez des confrères ou spécialistes vers lesquels vous orientez régulièrement
                  vos patients. Aucune donnée patient n’est enregistrée.
                </p>
                <button
                  type="button"
                  onClick={() => openPractitionerDialog(null)}
                  className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#177e78] px-4 text-sm font-semibold text-white"
                >
                  <Plus className="size-4" aria-hidden="true" /> Ajouter le premier professionnel
                </button>
              </div>
            ) : filteredPractitioners.length ? (
              <ul className="grid gap-3 md:grid-cols-2">
                {filteredPractitioners.map((item) => (
                  <PractitionerCard
                    key={item.id}
                    item={item}
                    onEdit={() => openPractitionerDialog(item)}
                    onToggle={() =>
                      void run(() =>
                        sendJson("/api/doctor-network", "PATCH", {
                          id: item.id,
                          hidden: !item.hidden,
                        }),
                      )
                    }
                    onDelete={() => setToDelete(item)}
                  />
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">
                Aucun professionnel ne correspond à votre recherche.
              </p>
            )}
          </section>

          <p className="flex items-start gap-2 rounded-xl bg-muted/50 px-4 py-3 text-xs leading-5 text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#177e78]" aria-hidden="true" />
            Kivoir enregistre les coordonnées professionnelles de votre réseau, jamais les
            informations de santé ou l’identité de vos patients.
          </p>
        </>
      ) : null}

      {network.data ? (
        <PractitionerDialog
          key={dialog.key}
          open={dialog.open}
          item={dialog.item}
          cabinet={network.data}
          onOpenChange={(open) => setDialog((current) => ({ ...current, open }))}
          onSaved={refresh}
        />
      ) : null}
      <ConfirmationDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Retirer ce professionnel du réseau ?"
        description={`${toDelete?.name ?? "Ce professionnel"} ne sera plus proposé dans votre annuaire patient. Vous pouvez aussi le masquer temporairement.`}
        onConfirm={() => {
          const target = toDelete;
          setToDelete(null);
          if (target)
            void run(() =>
              sendJson("/api/doctor-network", "DELETE", { practitionerId: target.id }),
            );
        }}
      />
    </main>
  );
}

function CabinetProfileForm({
  network,
  onSaved,
  onCancel,
}: {
  network: DoctorNetwork | null;
  onSaved: () => Promise<void>;
  onCancel?: (() => void) | undefined;
}) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    if (!data["name"]?.trim() || !data["address"]?.trim()) {
      setMessage("Le nom et l’adresse du cabinet sont obligatoires.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      await sendJson("/api/doctor-network", "PUT", {
        name: data["name"].trim(),
        address: data["address"].trim(),
        phone: data["phone"]?.trim(),
      });
      await onSaved();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "L’enregistrement a échoué.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
      aria-labelledby="cabinet-form-title"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f4ec] text-[#177e78]">
          <MapPin className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 id="cabinet-form-title" className="font-semibold text-foreground">
            {network
              ? "Modifier les coordonnées du cabinet"
              : "Commencez par renseigner votre cabinet"}
          </h2>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            Ces informations identifient votre réseau dans l’annuaire partagé avec le patient.
          </p>
        </div>
      </div>
      <form onSubmit={(event) => void submit(event)} className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-foreground">
          Nom du cabinet
          <input
            name="name"
            required
            defaultValue={network?.name ?? ""}
            autoComplete="organization"
            placeholder="Cabinet de kinésithérapie"
            className={inputClass}
          />
        </label>
        <label className="text-sm font-medium text-foreground">
          Téléphone du cabinet
          <input
            name="phone"
            type="tel"
            defaultValue={network?.phone ?? ""}
            autoComplete="tel"
            placeholder="01 23 45 67 89"
            className={inputClass}
          />
        </label>
        <label className="text-sm font-medium text-foreground sm:col-span-2">
          Adresse du cabinet
          <input
            name="address"
            required
            defaultValue={network?.address ?? ""}
            autoComplete="street-address"
            placeholder="12 rue des Lilas, 75011 Paris"
            className={inputClass}
          />
        </label>
        {message ? (
          <p role="alert" className="text-sm text-destructive sm:col-span-2">
            {message}
          </p>
        ) : null}
        <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="min-h-11 rounded-xl border border-border px-4 text-sm font-semibold text-foreground"
            >
              Annuler
            </button>
          ) : null}
          <button
            type="submit"
            disabled={saving}
            className="min-h-11 rounded-xl bg-[#177e78] px-5 text-sm font-semibold text-white transition hover:bg-[#126b66] disabled:cursor-wait disabled:opacity-60"
          >
            {saving
              ? "Enregistrement…"
              : network
                ? "Enregistrer les coordonnées"
                : "Créer mon réseau professionnel"}
          </button>
        </div>
      </form>
    </section>
  );
}

function PractitionerCard({
  item,
  onEdit,
  onToggle,
  onDelete,
}: {
  item: Practitioner;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <li
      className={`flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm transition hover:shadow-md ${item.hidden ? "border-dashed opacity-80" : "border-border"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#edf5ef] text-sm font-bold text-[#315a4c]">
            {item.name
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toLocaleUpperCase("fr")}
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-foreground">{item.name}</h3>
            <p className="mt-0.5 text-sm font-medium text-[#177e78]">{item.profession}</p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${item.hidden ? "bg-muted text-muted-foreground" : "bg-[#e7f4ec] text-[#287457]"}`}
        >
          {item.hidden ? "Masqué" : "Visible patient"}
        </span>
      </div>
      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        {item.phone ? (
          <p className="flex items-center gap-2">
            <Phone className="size-4 shrink-0" aria-hidden="true" />
            {item.phone}
          </p>
        ) : null}
        {item.email ? (
          <p className="flex items-center gap-2 break-all">
            <Mail className="size-4 shrink-0" aria-hidden="true" />
            {item.email}
          </p>
        ) : null}
        {item.address || item.city ? (
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              {[item.address, [item.postalCode, item.city].filter(Boolean).join(" ")]
                .filter(Boolean)
                .join(", ")}
            </span>
          </p>
        ) : null}
      </div>
      <div className="flex gap-2 border-t border-border pt-3">
        <button
          type="button"
          onClick={onEdit}
          className={iconButtonClass}
          aria-label={`Modifier ${item.name}`}
        >
          <Pencil className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onToggle}
          className={iconButtonClass}
          aria-label={
            item.hidden ? `Afficher ${item.name} aux patients` : `Masquer ${item.name} aux patients`
          }
          title={item.hidden ? "Afficher aux patients" : "Masquer aux patients"}
        >
          {item.hidden ? (
            <Eye className="size-4" aria-hidden="true" />
          ) : (
            <EyeOff className="size-4" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className={`${iconButtonClass} ml-auto text-destructive hover:bg-destructive/5 hover:text-destructive`}
          aria-label={`Supprimer ${item.name}`}
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}

function PractitionerDialog({
  open,
  item,
  cabinet,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  item: Practitioner | null;
  cabinet: DoctorNetwork;
  onOpenChange: (open: boolean) => void;
  onSaved: () => Promise<unknown>;
}) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    if (!data["name"]?.trim() || !data["profession"]?.trim()) {
      setMessage("Le nom et la spécialité sont obligatoires.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      if (item) await sendJson("/api/doctor-network", "PATCH", { id: item.id, ...data });
      else
        await sendJson("/api/doctor-network", "POST", {
          name: cabinet.name,
          address: cabinet.address,
          phone: cabinet.phone ?? undefined,
          practitioners: [data],
        });
      await onSaved();
      onOpenChange(false);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "L’enregistrement a échoué.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {item ? "Modifier le professionnel" : "Ajouter un professionnel"}
          </DialogTitle>
          <DialogDescription>
            Ces coordonnées professionnelles seront visibles par vos patients lorsque la fiche est
            publiée.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Nom du professionnel
              <input
                name="name"
                required
                defaultValue={item?.name ?? ""}
                autoComplete="name"
                className={inputClass}
              />
            </label>
            <label className="text-sm font-medium">
              Spécialité
              <input
                name="profession"
                required
                defaultValue={item?.profession ?? ""}
                placeholder="Podologue, médecin du sport…"
                className={inputClass}
              />
            </label>
            <label className="text-sm font-medium">
              Téléphone
              <input
                name="phone"
                type="tel"
                defaultValue={item?.phone ?? ""}
                autoComplete="tel"
                className={inputClass}
              />
            </label>
            <label className="text-sm font-medium">
              E-mail
              <input
                name="email"
                type="email"
                defaultValue={item?.email ?? ""}
                autoComplete="email"
                className={inputClass}
              />
            </label>
          </div>
          <label className="text-sm font-medium">
            Adresse
            <input
              name="address"
              defaultValue={item?.address ?? ""}
              autoComplete="street-address"
              className={inputClass}
            />
          </label>
          <div className="grid grid-cols-[120px_1fr] gap-4">
            <label className="text-sm font-medium">
              Code postal
              <input
                name="postalCode"
                inputMode="numeric"
                defaultValue={item?.postalCode ?? ""}
                autoComplete="postal-code"
                className={inputClass}
              />
            </label>
            <label className="text-sm font-medium">
              Ville
              <input
                name="city"
                defaultValue={item?.city ?? ""}
                autoComplete="address-level2"
                className={inputClass}
              />
            </label>
          </div>
          {message ? (
            <p role="alert" className="text-sm text-destructive">
              {message}
            </p>
          ) : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="min-h-11 rounded-xl border border-border px-4 text-sm font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-11 rounded-xl bg-[#177e78] px-5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
