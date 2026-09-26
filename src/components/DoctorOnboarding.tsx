import { useEffect, useState } from "react";
import { Check, Pencil, Search, Trash2, Plus, X } from "lucide-react";

const emptyPractitioner = { name: "", profession: "", phone: "", email: "", address: "", postalCode: "", city: "" };

function splitAddress(value: string) {
  const match = value.trim().match(/^(.*?)(?:,\s*)?(\d{5})\s+(.+)$/);
  return match ? { street: match[1].trim(), postalCode: match[2], city: match[3].trim() } : { street: value.trim(), postalCode: "", city: "" };
}

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
  const [addressLine, setAddressLine] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [drafts, setDrafts] = useState<Practitioner[]>([]);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [professionFilter, setProfessionFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPractitioner, setEditingPractitioner] = useState<Practitioner | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/doctor-network").then(async (response) => {
      if (!response.ok) return;
      const data = await response.json();
      if (data) {
        setNetwork(data);
        setName(data.name);
        const address = splitAddress(data.address ?? "");
        setAddressLine(address.street);
        setPostalCode(address.postalCode);
        setCity(address.city);
        setPhone(data.phone ?? "");
      }
    });
  }, []);

  const existing = network?.practitioners ?? [];
  const availableProfessions = Array.from(new Set(existing.map((practitioner) => practitioner.profession.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, "fr"));
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("fr");
  const visiblePractitioners = existing.filter((practitioner) => {
    const matchesProfession = !professionFilter || practitioner.profession.trim() === professionFilter;
    const matchesSearch = !normalizedQuery || [practitioner.name, practitioner.profession, practitioner.phone, practitioner.email]
      .some((value) => String(value ?? "").toLocaleLowerCase("fr").includes(normalizedQuery));
    return matchesProfession && matchesSearch;
  });
  const professionTone = (profession: string) => {
    const normalized = profession
      .trim()
      .toLocaleLowerCase("fr")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    if (normalized === "rhumatologue") return "red" as const;
    if (normalized === "medecin du sport" || normalized.includes("sport")) return "green" as const;
    return "default" as const;
  };
  const professionStyles = {
    red: { text: "#dc2626", border: "#fecaca", active: "#dc2626" },
    green: { text: "#15803d", border: "#bbf7d0", active: "#15803d" },
    default: { text: "var(--muted-foreground)", border: "var(--border)", active: "var(--care)" },
  };

  const updateDraft = (index: number, field: keyof typeof emptyPractitioner, value: string) => {
    setDrafts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  };

  const startEditing = (practitioner: Practitioner) => {
    setEditingId(practitioner.id ?? null);
    const fallback = splitAddress(network?.address ?? "");
    setEditingPractitioner({ ...practitioner, phone: practitioner.phone ?? "", email: practitioner.email ?? "", address: practitioner.address ?? fallback.street, postalCode: practitioner.postalCode ?? fallback.postalCode, city: practitioner.city ?? fallback.city });
    setNotice("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingPractitioner(null);
  };

  const saveEdit = async () => {
    if (!editingId || !editingPractitioner) return;
    setUpdatingId(editingId);
    setNotice("");
    const response = await fetch("/api/doctor-network", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(editingPractitioner),
    });
    const data = await response.json();
    setUpdatingId(null);
    if (!response.ok) {
      setNotice(data.error ?? "Impossible de modifier ce professionnel.");
      return;
    }
    setNetwork(data);
    cancelEditing();
    setNotice("Professionnel modifié.");
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
      body: JSON.stringify({ name, address: `${addressLine.trim()}, ${postalCode.trim()} ${city.trim()}`.trim(), phone, practitioners }),
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
          <p className="text-xs font-semibold uppercase tracking-wide text-care">Réseau professionnel</p>
          <h2 id="onboarding-title" className="mt-2 text-2xl font-semibold text-foreground">Mon réseau professionnel</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Ajoutez, modifiez ou retirez les professionnels de votre réseau présenté aux patients, à titre informatif.</p>
        </div>
        {network && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Réseau publié</span>}
      </div>

      <form onSubmit={submit} autoComplete="off" onSubmitCapture={(event) => { const form = event.currentTarget; form.querySelectorAll<HTMLInputElement>("input").forEach((input) => input.setAttribute("autocomplete", "off")); }} className="mt-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-foreground">Nom du cabinet<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 font-normal" placeholder="Cabinet du Dr A" /></label>
          <label className="text-sm font-medium text-foreground">Téléphone<input value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 font-normal" placeholder="01 00 00 00 00" /></label>
        </div>
        <div className="grid gap-4 md:grid-cols-[1.5fr_0.75fr_1fr]">
          <label className="text-sm font-medium text-foreground">Numéro et rue<input required autoComplete="off" name="street_custom" id="street_custom" value={addressLine} onChange={(event) => setAddressLine(event.target.value.replace(/\s*,?\s*\d{5}\s+[^,]+$/, "").trim())} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 font-normal" placeholder="22 rue Saint Paulin" /></label>
          <label className="text-sm font-medium text-foreground">Code postal<input required autoComplete="postal-code" name="xyz_cp_9988" id="xyz_cp_9988" inputMode="numeric" pattern="[0-9]{5}" maxLength={5} value={postalCode} onChange={(event) => setPostalCode(event.target.value.replace(/\D/g, "").slice(0, 5))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 font-normal" /></label>
          <label className="text-sm font-medium text-foreground">Ville<input required autoComplete="off" name="city_custom" id="city_custom" value={city} onChange={(event) => setCity(event.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 font-normal" placeholder="Saint-Maur-des-Fossés" /></label>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Professionnels de votre réseau</h3>
          {existing.length > 0 && (
            <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-care/60 focus-within:ring-2 focus-within:ring-care/10">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">Rechercher un professionnel</span>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                placeholder="Rechercher par nom, spécialité ou téléphone"
                type="search"
              />
            </label>
          )}
          {availableProfessions.length > 0 && (
            <div className="flex flex-wrap gap-2" aria-label="Filtrer par spécialité">
              <button
                type="button"
                onClick={() => setProfessionFilter(null)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${professionFilter === null ? "bg-foreground text-background" : "border border-border bg-background text-muted-foreground hover:text-foreground"}`}
              >
                Tous les professionnels
              </button>
              {availableProfessions.map((profession) => (
                <button
                  key={profession}
                  type="button"
                  onClick={() => setProfessionFilter(profession)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${professionFilter === profession ? "text-white" : "bg-background"}`}
                style={{
                  color: professionFilter === profession ? "#fff" : professionStyles[professionTone(profession)].text,
                  backgroundColor: professionFilter === profession ? professionStyles[professionTone(profession)].active : undefined,
                  borderColor: professionStyles[professionTone(profession)].border,
                }}
                >
                  {profession}
                </button>
              ))}
            </div>
          )}
          {existing.length === 0 && drafts.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">Aucun professionnel pour le moment. Ajoutez la première personne de votre réseau ci-dessous.</p>
          )}

          <ul className="space-y-3">
            {visiblePractitioners.map((practitioner) => (
              <li
                key={practitioner.id}
                className="flex items-start justify-between gap-4 rounded-2xl border bg-card p-4"
                style={{ borderColor: professionStyles[professionTone(practitioner.profession)].border }}
              >
                {editingId === practitioner.id && editingPractitioner ? (
                  <div className="w-full space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <input required value={editingPractitioner.name} onChange={(event) => setEditingPractitioner({ ...editingPractitioner, name: event.target.value })} className="rounded-lg border border-input bg-background px-3 py-2" aria-label="Nom du professionnel" />
                      <input required value={editingPractitioner.profession} onChange={(event) => setEditingPractitioner({ ...editingPractitioner, profession: event.target.value })} className="rounded-lg border border-input bg-background px-3 py-2" aria-label="Spécialité du professionnel" />
                      <input value={editingPractitioner.phone ?? ""} onChange={(event) => setEditingPractitioner({ ...editingPractitioner, phone: event.target.value })} className="rounded-lg border border-input bg-background px-3 py-2" placeholder="Téléphone (optionnel)" aria-label="Téléphone du professionnel" />
                      <input type="email" value={editingPractitioner.email ?? ""} onChange={(event) => setEditingPractitioner({ ...editingPractitioner, email: event.target.value })} className="rounded-lg border border-input bg-background px-3 py-2" placeholder="Email (optionnel)" aria-label="Email du professionnel" />
                      <input value={editingPractitioner.address ?? ""} onChange={(event) => setEditingPractitioner({ ...editingPractitioner, address: event.target.value })} className="rounded-lg border border-input bg-background px-3 py-2" placeholder="Numéro et rue" aria-label="Numéro et rue du professionnel" />
                      <input inputMode="numeric" pattern="[0-9]{5}" maxLength={5} value={editingPractitioner.postalCode ?? ""} onChange={(event) => setEditingPractitioner({ ...editingPractitioner, postalCode: event.target.value.replace(/\D/g, "").slice(0, 5) })} className="rounded-lg border border-input bg-background px-3 py-2" placeholder="Code postal" aria-label="Code postal du professionnel" />
                      <input value={editingPractitioner.city ?? ""} onChange={(event) => setEditingPractitioner({ ...editingPractitioner, city: event.target.value })} className="rounded-lg border border-input bg-background px-3 py-2" placeholder="Ville" aria-label="Ville du professionnel" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={saveEdit} disabled={updatingId === practitioner.id} className="flex items-center gap-1.5 rounded-lg bg-care px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"><Check className="h-4 w-4" aria-hidden="true" />{updatingId === practitioner.id ? "Enregistrement…" : "Enregistrer"}</button>
                      <button type="button" onClick={cancelEditing} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground"><X className="h-4 w-4" aria-hidden="true" />Annuler</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{practitioner.name}</p>
                      <p className="text-sm font-semibold" style={{ color: professionStyles[professionTone(practitioner.profession)].text }}>{practitioner.profession}</p>
                      {(() => { const cabinet = splitAddress(network?.address ?? ""); const street = practitioner.address?.trim() || cabinet.street; const postal = practitioner.postalCode?.trim() || cabinet.postalCode; const town = practitioner.city?.trim() || cabinet.city; const formatted = [street, [postal, town].filter(Boolean).join(" ")].filter(Boolean).join(", "); return formatted ? <p className="mt-1 max-w-full truncate text-xs text-muted-foreground" title={formatted}>{formatted}</p> : null; })()}
                      {(practitioner.phone || practitioner.email) && <p className="mt-1 truncate text-xs text-muted-foreground">{[practitioner.phone, practitioner.email].filter(Boolean).join(" · ")}</p>}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button type="button" onClick={() => startEditing(practitioner)} className="flex items-center gap-1.5 rounded-lg border border-care/30 px-2.5 py-1.5 text-xs font-semibold text-care hover:bg-care/10" aria-label={`Modifier ${practitioner.name}`}><Pencil className="h-4 w-4" aria-hidden="true" />Modifier</button>
                      <button type="button" onClick={() => practitioner.id && removeExisting(practitioner.id)} disabled={removingId === practitioner.id} className="flex items-center gap-1.5 rounded-lg border border-destructive/30 px-2.5 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50" aria-label={`Retirer ${practitioner.name} du réseau`}><Trash2 className="h-4 w-4" aria-hidden="true" />{removingId === practitioner.id ? "Suppression…" : "Supprimer"}</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>

          {existing.length > 0 && visiblePractitioners.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
              Aucun professionnel ne correspond à votre recherche.
            </p>
          )}

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
                <input value={practitioner.address} onChange={(event) => updateDraft(index, "address", event.target.value)} className="rounded-lg border border-input bg-background px-3 py-2" placeholder="Numéro et rue (cabinet par défaut)" />
                <input inputMode="numeric" pattern="[0-9]{5}" maxLength={5} value={practitioner.postalCode} onChange={(event) => updateDraft(index, "postalCode", event.target.value.replace(/\D/g, "").slice(0, 5))} className="rounded-lg border border-input bg-background px-3 py-2" placeholder="Code postal (cabinet par défaut)" />
                <input value={practitioner.city} onChange={(event) => updateDraft(index, "city", event.target.value)} className="rounded-lg border border-input bg-background px-3 py-2" placeholder="Ville (cabinet par défaut)" />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => { const fallback = splitAddress(network?.address ?? ""); setDrafts((current) => [...current, { ...emptyPractitioner, address: fallback.street, postalCode: fallback.postalCode, city: fallback.city }]); }}
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
