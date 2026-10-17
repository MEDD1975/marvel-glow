import { createFileRoute, Link } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { KeyRound } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type ResetSearch = { token?: string | undefined; error?: string | undefined };

const MIN_PASSWORD_LENGTH = 10;
const inputClass = "mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground outline-none focus:border-care";

export const Route = createFileRoute("/nouveau-mot-de-passe")({
  head: () => ({ meta: [{ title: "Nouveau mot de passe — Kivoir" }, { name: "robots", content: "noindex" }] }),
  validateSearch: (search: Record<string, unknown>): ResetSearch => ({
    token: typeof search["token"] === "string" ? search["token"] : undefined,
    error: typeof search["error"] === "string" ? search["error"] : undefined,
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token, error: linkError } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password.length < MIN_PASSWORD_LENGTH) return setError(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`);
    if (password !== confirmation) return setError("Les deux mots de passe ne correspondent pas.");
    setPending(true);
    const result = await authClient.resetPassword({ newPassword: password, token: token ?? "" });
    setPending(false);
    if (result.error) return setError("Ce lien est invalide ou expiré. Demandez un nouveau lien depuis la page de connexion.");
    setDone(true);
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10 md:py-16">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-care/10 text-care">
          <KeyRound className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-care">Espace médecin</p>
        <h1 className="mt-2 text-3xl font-semibold text-foreground">Nouveau mot de passe</h1>

        {!token || linkError ? (
          <div role="alert" className="mt-6 rounded-2xl border border-border bg-muted p-4 text-sm">
            <p className="font-semibold text-foreground">Ce lien est invalide ou expiré.</p>
            <Link to="/connexion-medecin" className="mt-3 inline-block font-semibold text-care hover:underline">Demander un nouveau lien</Link>
          </div>
        ) : done ? (
          <div role="status" className="mt-6 rounded-2xl border border-care/20 bg-care/5 p-4 text-sm">
            <p className="font-semibold text-foreground">Mot de passe modifié.</p>
            <p className="mt-1 text-muted-foreground">Vos autres sessions ont été fermées par sécurité.</p>
            <Link to="/connexion-medecin" className="mt-3 inline-block font-semibold text-care hover:underline">Se connecter</Link>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-foreground">
              Nouveau mot de passe
              <input className={inputClass} type="password" autoComplete="new-password" required minLength={MIN_PASSWORD_LENGTH} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} />
              <span className="mt-1 block text-xs font-normal text-muted-foreground">Au moins {MIN_PASSWORD_LENGTH} caractères.</span>
            </label>
            <label className="block text-sm font-medium text-foreground">
              Confirmer le mot de passe
              <input className={inputClass} type="password" autoComplete="new-password" required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
            </label>
            {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
            <button className="w-full rounded-xl bg-care px-4 py-3 font-semibold text-primary-foreground disabled:opacity-60" type="submit" disabled={pending}>
              {pending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
