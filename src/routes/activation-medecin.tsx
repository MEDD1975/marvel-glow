import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { KeyRound } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type ActivationSearch = { token?: string | undefined };
type InvitationPreview = { email: string; displayName: string; professionLabel: string; cabinetName: string | null };

const MIN_PASSWORD_LENGTH = 10;
const inputClass = "mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground outline-none focus:border-care";

export const Route = createFileRoute("/activation-medecin")({
  head: () => ({ meta: [{ title: "Activer votre compte — Kivoir" }, { name: "robots", content: "noindex" }] }),
  validateSearch: (search: Record<string, unknown>): ActivationSearch => ({
    token: typeof search["token"] === "string" ? search["token"] : undefined,
  }),
  component: ActivationPage,
});

async function fetchInvitation(token: string): Promise<InvitationPreview> {
  const response = await fetch(`/api/doctor-activation?token=${encodeURIComponent(token)}`);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? "Lien invalide.");
  return body as InvitationPreview;
}

function ActivationPage() {
  const { token = "" } = Route.useSearch();
  const navigate = useNavigate();
  const invitation = useQuery({ queryKey: ["activation", token], enabled: Boolean(token), retry: false, queryFn: () => fetchInvitation(token) });
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password.length < MIN_PASSWORD_LENGTH) return setError(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`);
    if (password !== confirmation) return setError("Les deux mots de passe ne correspondent pas.");
    setPending(true);
    const response = await fetch("/api/doctor-activation", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setPending(false);
      return setError(body.error ?? "L’activation n’a pas pu aboutir.");
    }
    const signIn = await authClient.signIn.email({ email: body.email, password });
    setPending(false);
    await navigate({ to: signIn.error ? "/connexion-medecin" : "/cabinet" });
  }

  const invalid = !token || invitation.isError;

  return (
    <main className="mx-auto max-w-lg px-4 py-10 md:py-16">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-care/10 text-care">
          <KeyRound className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-care">Invitation Kivoir</p>
        <h1 className="mt-2 text-3xl font-semibold text-foreground">Activer votre compte</h1>

        {invalid ? (
          <div role="alert" className="mt-6 rounded-2xl border border-border bg-muted p-4 text-sm text-foreground">
            <p className="font-semibold">Ce lien d’activation est invalide, expiré ou déjà utilisé.</p>
            <p className="mt-1 text-muted-foreground">Demandez une nouvelle invitation à l’équipe Kivoir, ou connectez-vous si votre compte est déjà activé.</p>
            <Link to="/connexion-medecin" className="mt-3 inline-block font-semibold text-care hover:underline">Aller à la connexion</Link>
          </div>
        ) : invitation.isPending ? (
          <p className="mt-6 text-sm text-muted-foreground" role="status">Vérification de l’invitation…</p>
        ) : (
          <>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Bonjour {invitation.data.displayName} ({invitation.data.professionLabel}), choisissez votre mot de passe pour accéder à votre espace professionnel
              {invitation.data.cabinetName ? <> « {invitation.data.cabinetName} »</> : null}.
            </p>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-foreground">
                Email professionnel
                <input className={`${inputClass} bg-muted text-muted-foreground`} type="email" autoComplete="username" readOnly value={invitation.data.email} />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Mot de passe
                <input className={inputClass} type="password" autoComplete="new-password" required minLength={MIN_PASSWORD_LENGTH} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} />
                <span className="mt-1 block text-xs font-normal text-muted-foreground">Au moins {MIN_PASSWORD_LENGTH} caractères.</span>
              </label>
              <label className="block text-sm font-medium text-foreground">
                Confirmer le mot de passe
                <input className={inputClass} type="password" autoComplete="new-password" required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
              </label>
              {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
              <button className="w-full rounded-xl bg-care px-4 py-3 font-semibold text-primary-foreground disabled:opacity-60" type="submit" disabled={pending}>
                {pending ? "Activation…" : "Activer mon compte"}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
