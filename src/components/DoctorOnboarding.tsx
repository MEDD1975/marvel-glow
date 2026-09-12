import { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";

const emptyPractitioner = { name: "", profession: "", phone: "", email: "" };

type Practitioner = typeof emptyPractitioner & { id?: string };

type Network = {
  name: string;
  address: string;
  phone: string | null;
  status: string;
  practitioners: Practitioner[];
};

export function DoctorOnboarding() {
  const [network, setNetwork] = useState<null | Network>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [drafts, setDrafts] = useState<Practitioner[]>([]);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/doctor-network").then(async (response) => {
      if (!response.ok) return;
      const data = await response.json();
      if (data) {
        setNetwork(data);
        setName(data.name);
        setAddress(data.address);
        setPhone(data.phone ?? "");
      }
    });
  }, []);

  const existing = network?.practitioners ?? [];

  const updateDraft = (index: number, field: keyof typeof emptyPractitioner, value: string) => {
    setDrafts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  };

  const removeExisting = async (practitionerId: string) => {
    setRemovingId(practitionerId);
    setNotice("");
    const response = await fetch("/api/doctor-network", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ practitionerId }),
    });
    const data = await response.json();
    setRemovingId(null);
    if (!response.ok) {
      setNotice(data.error ?? "Impossible de supprimer ce professionnel.");
      return;
    }
    setNetwork(data);
    setNotice("Professionnel retiré du réseau.");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    const practitioners = [...existing, ...drafts].filter((item) => item.name.trim() && item.profession.trim());
    if (!practitioners.length) {
      setSaving(false);
      setNotice("Ajoutez au moins un professionnel à votre réseau.");
      return;
    }
    const response = await fetch("/api/doctor-network", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, address, phone, practitioners }),
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) {
      setNotice(data.error ?? "Impossible d’enregistrer ces informations.");
      return;
    }
    setNetwork(data);
    setDrafts([]);
    setNotice("Votre réseau professionnel est enregistré et publié.");
  };

  return (
    <section className="mt-10 rounded-3xl border border-care/25 bg-care/5 px-6 pt-6 pb-6 md:px-8 md:pt-8 md:pb-6 print:hidden" aria-labelledby="onboarding-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-care">Configuration du réseau</p>
          <h2 id="onboarding-title" className="mt-2 text-2xl font-semibold text-foreground">Configurez votre réseau professionnel</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Ajoutez les professionnels avec lesquels vous travaillez afin de les présenter aux patients, à titre informatif.</p>
        </div>
        {network && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Réseau publié</span>}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-foreground">Nom du cabinet<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 font-normal" placeholder="Cabinet du Dr A" /></label>
          <label className="text-sm font-medium text-foreground">Téléphone<input value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 font-normal" placeholder="01 00 00 00 00" /></label>
        </div>
        <label className="block text-sm font-medium text-foreground">Adresse<input required value={address} onChange={(event) => setAddress(event.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 font-normal" placeholder="Adresse du cabinet" /></label>

        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Professionnels de votre réseau</h3>
          {existing.length === 0 && drafts.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">Aucun professionnel pour le moment. Ajoutez la première personne de votre réseau ci-dessous.</p>
          )}

          <ul className="space-y-3">
            {existing.map((practitioner) => (
              <li key={practitioner.id} className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-card p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{practitioner.name}</p>
                  <p className="text-sm text-muted-foreground">{practitioner.profession}</p>
                  {(practitioner.phone || practitioner.email) && (
                    <p className="mt-1 truncate text-xs text-muted-foreground">{[practitioner.phone, practitioner.email].filter(Boolean).join(" · ")}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => practitioner.id && removeExisting(practitioner.id)}
                  disabled={removingId === practitioner.id}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-destructive/30 px-2.5 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                  aria-label={`Retirer ${practitioner.name} du réseau`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  {removingId === practitioner.id ? "Suppression…" : "Supprimer"}
                </button>
              </li>
            ))}
          </ul>

          {drafts.map((practitioner, index) => (
            <div key={`draft-${index}`} className="rounded-2xl border border-care/30 bg-background p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-care">Nouveau professionnel</p>
                <button type="button" onClick={() => setDrafts((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="flex items-center gap-1.5 text-xs font-semibold text-destructive" aria-label="Annuler ce professionnel">
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Annuler
                </button>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <input required value={practitioner.name} onChange={(event) => updateDraft(index, "name", event.target.value)} className="rounded-lg border border-input bg-background px-3 py-2" placeholder="Nom du praticien" />
                <input required value={practitioner.profession} onChange={(event) => updateDraft(index, "profession", event.target.value)} className="rounded-lg border border-input bg-background px-3 py-2" placeholder="Métier, ex. Kinésithérapeute" />
                <input value={practitioner.phone} onChange={(event) => updateDraft(index, "phone", event.target.value)} className="rounded-lg border border-input bg-background px-3 py-2" placeholder="Téléphone (optionnel)" />
                <input type="email" value={practitioner.email} onChange={(event) => updateDraft(index, "email", event.target.value)} className="rounded-lg border border-input bg-background px-3 py-2" placeholder="Email (optionnel)" />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setDrafts((current) => [...current, { ...emptyPractitioner }])}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-care/40 bg-background px-4 py-3 text-sm font-semibold text-care transition-colors hover:bg-care/5"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Ajouter une personne au réseau
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button disabled={saving} className="rounded-lg bg-care px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">{saving ? "Enregistrement…" : "Enregistrer mon réseau"}</button>
          {notice && <p className="text-sm text-muted-foreground" role="status">{notice}</p>}
        </div>
      </form>
    </section>
  );
}
