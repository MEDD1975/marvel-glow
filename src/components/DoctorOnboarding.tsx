import { useEffect, useState } from "react";

const emptyPractitioner = { name: "", profession: "", phone: "", email: "" };

type Practitioner = typeof emptyPractitioner;

export function DoctorOnboarding() {
  const [network, setNetwork] = useState<null | { name: string; address: string; phone: string | null; status: string; practitioners: Practitioner[] }>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [practitioners, setPractitioners] = useState<Practitioner[]>([{ ...emptyPractitioner }]);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetch("/api/doctor-network").then(async (response) => {
      if (!response.ok) return;
      const data = await response.json();
      if (data) {
        setNetwork(data);
        setName(data.name);
        setAddress(data.address);
        setPhone(data.phone ?? "");
        setPractitioners(data.practitioners.length ? data.practitioners : [{ ...emptyPractitioner }]);
      }
    });
  }, []);

  const updatePractitioner = (index: number, field: keyof Practitioner, value: string) => {
    setPractitioners((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
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
      <form onSubmit={submit} className="mt-6 space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-foreground">Nom du cabinet<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 font-normal" placeholder="Cabinet du Dr A" /></label>
          <label className="text-sm font-medium text-foreground">Téléphone<input value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 font-normal" placeholder="01 00 00 00 00" /></label>
        </div>
        <label className="block text-sm font-medium text-foreground">Adresse<input required value={address} onChange={(event) => setAddress(event.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 font-normal" placeholder="Adresse du cabinet" /></label>
        <div className="space-y-3">
          <div className="flex items-center justify-between"><h3 className="font-semibold text-foreground">Réseau professionnel</h3><button type="button" onClick={() => setPractitioners((current) => [...current, { ...emptyPractitioner }])} className="text-sm font-semibold text-care">+ Ajouter</button></div>
          {practitioners.map((practitioner, index) => <div key={index} className="grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-2"><input required value={practitioner.name} onChange={(event) => updatePractitioner(index, "name", event.target.value)} className="rounded-lg border border-input bg-background px-3 py-2" placeholder="Nom du praticien" /><input required value={practitioner.profession} onChange={(event) => updatePractitioner(index, "profession", event.target.value)} className="rounded-lg border border-input bg-background px-3 py-2" placeholder="Métier, ex. Kinésithérapeute" /><input value={practitioner.phone} onChange={(event) => updatePractitioner(index, "phone", event.target.value)} className="rounded-lg border border-input bg-background px-3 py-2" placeholder="Téléphone (optionnel)" /><input type="email" value={practitioner.email} onChange={(event) => updatePractitioner(index, "email", event.target.value)} className="rounded-lg border border-input bg-background px-3 py-2" placeholder="Email (optionnel)" /></div>)}
        </div>
        <div className="flex flex-wrap items-center gap-3"><button disabled={saving} className="rounded-lg bg-care px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">{saving ? "Enregistrement…" : "Enregistrer mon réseau"}</button>{notice && <p className="text-sm text-muted-foreground" role="status">{notice}</p>}</div>
      </form>
    </section>
  );
}
