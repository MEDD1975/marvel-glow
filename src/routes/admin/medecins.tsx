import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { MailPlus, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { PROFESSIONS, professionLabel } from "@/lib/professions";

type Invitation = {
  id: string;
  email: string;
  profession: string | null;
  firstName: string;
  lastName: string;
  cabinetName: string | null;
  status: "pending" | "used" | "cancelled";
  createdAt: string;
  sentAt: string | null;
  expiresAt: string;
};
type Doctor = { id: string; name: string; email: string; profession: string | null; createdAt: string; disabledAt: string | null; cabinetName: string | null };
type AdminData = { doctors: Doctor[]; invitations: Invitation[] };

const emptyForm = { email: "", profession: "", firstName: "", lastName: "", cabinetName: "", phone: "", address: "", postalCode: "", city: "" };
const inputClass = "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-care";
const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" });

export const Route = createFileRoute("/admin/medecins")({
  head: () => ({ meta: [{ title: "Professionnels — Administration Kivoir" }, { name: "robots", content: "noindex" }] }),
  component: AdminDoctorsPage,
});

class HttpError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(method: string, body?: unknown): Promise<T> {
  const init: RequestInit = { method };
  if (body) {
    init.headers = { "content-type": "application/json" };
    init.body = JSON.stringify(body);
  }
  const response = await fetch("/api/admin/doctors", init);
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new HttpError(json.error ?? "Erreur inattendue.", response.status);
  return json as T;
}

function invitationLabel(invitation: Invitation) {
  if (invitation.status === "used") return "Activée";
  if (invitation.status === "cancelled") return "Annulée";
  return new Date(invitation.expiresAt) < new Date() ? "Expirée" : "En attente";
}

function AdminDoctorsPage() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const queryClient = useQueryClient();
  const data = useQuery({ queryKey: ["admin", "doctors"], enabled: Boolean(session?.user), retry: false, queryFn: () => request<AdminData>("GET") });
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "doctors"] });
  const invite = useMutation({
    mutationFn: () => request("POST", form),
    onSuccess: () => {
      setMessage({ kind: "ok", text: `Invitation envoyée à ${form.email}.` });
      setForm(emptyForm);
      void refresh();
    },
    onError: (error: Error) => {
      setMessage({ kind: "error", text: error.message });
      void refresh();
    },
  });
  const action = useMutation({
    mutationFn: (input: { action: "resend" | "cancel" | "disable" | "enable"; id: string }) => request("PATCH", input),
    onSuccess: (_result, input) => {
      const texts = { resend: "Invitation renvoyée.", cancel: "Invitation annulée.", disable: "Professionnel désactivé.", enable: "Professionnel réactivé." };
      setMessage({ kind: "ok", text: texts[input.action] });
      void refresh();
    },
    onError: (error: Error) => setMessage({ kind: "error", text: error.message }),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    invite.mutate();
  }

  if (sessionPending) return <Shell><p role="status" className="text-sm text-muted-foreground">Chargement…</p></Shell>;
  if (!session?.user || (data.error instanceof HttpError && data.error.status === 403)) {
    return (
      <Shell>
        <div role="alert" className="rounded-2xl border border-border bg-card p-6 text-sm">
          <p className="font-semibold text-foreground">Accès réservé à l’administration Kivoir.</p>
          <Link to="/connexion-medecin" className="mt-3 inline-block font-semibold text-care hover:underline">Se connecter avec un compte administrateur</Link>
        </div>
      </Shell>
    );
  }

  const field = (key: keyof typeof emptyForm, label: string, props: Record<string, unknown> = {}) => (
    <label className="block text-sm font-medium text-foreground">
      {label}
      <input className={inputClass} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} {...props} />
    </label>
  );

  return (
    <Shell>
      <section aria-labelledby="invite-title" className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <MailPlus className="h-5 w-5 text-care" aria-hidden="true" />
          <h2 id="invite-title" className="text-lg font-semibold text-foreground">Inviter un professionnel de santé</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Le professionnel reçoit un lien valable 7 jours pour choisir son mot de passe. Son espace est créé à l’activation, avec les 10 parcours TMS.</p>
        <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-foreground md:col-span-2">
            Profession *
            <select required className={inputClass} value={form.profession} onChange={(event) => setForm({ ...form, profession: event.target.value })}>
              <option value="" disabled>Choisir une profession</option>
              {PROFESSIONS.map((profession) => <option key={profession.id} value={profession.id}>{profession.label}</option>)}
            </select>
          </label>
          {field("firstName", "Prénom *", { required: true, maxLength: 80, autoComplete: "off" })}
          {field("lastName", "Nom *", { required: true, maxLength: 80, autoComplete: "off" })}
          {field("email", "E-mail professionnel *", { required: true, type: "email", maxLength: 254, autoComplete: "off" })}
          {field("cabinetName", "Nom du cabinet", { maxLength: 160 })}
          {field("phone", "Téléphone", { type: "tel", maxLength: 30 })}
          {field("address", "Adresse", { maxLength: 200 })}
          {field("postalCode", "Code postal", { inputMode: "numeric", pattern: "\\d{5}", maxLength: 5 })}
          {field("city", "Ville", { maxLength: 100 })}
          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <button type="submit" disabled={invite.isPending} className="min-h-11 rounded-xl bg-care px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
              {invite.isPending ? "Envoi…" : "Envoyer l’invitation"}
            </button>
            {message ? (
              <p role={message.kind === "error" ? "alert" : "status"} className={message.kind === "error" ? "text-sm text-destructive" : "text-sm text-care"}>
                {message.text}
              </p>
            ) : null}
          </div>
        </form>
      </section>

      <section aria-labelledby="invitations-title" className="mt-8">
        <h2 id="invitations-title" className="text-lg font-semibold text-foreground">Invitations</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <tr><th className="px-4 py-3">Professionnel</th><th className="px-4 py-3">Cabinet</th><th className="px-4 py-3">Statut</th><th className="px-4 py-3">Expire le</th><th className="px-4 py-3"><span className="sr-only">Actions</span></th></tr>
            </thead>
            <tbody>
              {data.data?.invitations.length ? data.data.invitations.map((invitation) => (
                <tr key={invitation.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3"><p className="font-medium text-foreground">{invitation.firstName} {invitation.lastName}</p><p className="text-xs text-muted-foreground">{professionLabel(invitation.profession)} · {invitation.email}</p></td>
                  <td className="px-4 py-3 text-muted-foreground">{invitation.cabinetName ?? "—"}</td>
                  <td className="px-4 py-3">{invitationLabel(invitation)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{dateFormat.format(new Date(invitation.expiresAt))}</td>
                  <td className="px-4 py-3 text-right">
                    {invitation.status === "pending" ? (
                      <div className="flex justify-end gap-2">
                        <button type="button" disabled={action.isPending} onClick={() => action.mutate({ action: "resend", id: invitation.id })} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted">Renvoyer</button>
                        <button type="button" disabled={action.isPending} onClick={() => window.confirm(`Annuler l’invitation de ${invitation.email} ?`) && action.mutate({ action: "cancel", id: invitation.id })} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-muted">Annuler</button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              )) : <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">{data.isPending ? "Chargement…" : "Aucune invitation."}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="doctors-title" className="mt-8">
        <h2 id="doctors-title" className="text-lg font-semibold text-foreground">Professionnels</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <tr><th className="px-4 py-3">Professionnel</th><th className="px-4 py-3">Cabinet</th><th className="px-4 py-3">Statut</th><th className="px-4 py-3"><span className="sr-only">Actions</span></th></tr>
            </thead>
            <tbody>
              {data.data?.doctors.length ? data.data.doctors.map((doctor) => (
                <tr key={doctor.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3"><p className="font-medium text-foreground">{doctor.name}</p><p className="text-xs text-muted-foreground">{professionLabel(doctor.profession)} · {doctor.email}</p></td>
                  <td className="px-4 py-3 text-muted-foreground">{doctor.cabinetName ?? "—"}</td>
                  <td className="px-4 py-3">{doctor.disabledAt ? <span className="text-destructive">Désactivé</span> : "Actif"}</td>
                  <td className="px-4 py-3 text-right">
                    {doctor.disabledAt ? (
                      <button type="button" disabled={action.isPending} onClick={() => action.mutate({ action: "enable", id: doctor.id })} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted">Réactiver</button>
                    ) : (
                      <button type="button" disabled={action.isPending} onClick={() => window.confirm(`Désactiver ${doctor.email} ? Ses sessions seront fermées et ses QR ne fonctionneront plus.`) && action.mutate({ action: "disable", id: doctor.id })} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-muted">Désactiver</button>
                    )}
                  </td>
                </tr>
              )) : <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">{data.isPending ? "Chargement…" : "Aucun professionnel."}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:py-12">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-care">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        Administration Kivoir
      </div>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Professionnels et invitations</h1>
      <div className="mt-8">{children}</div>
    </main>
  );
}
