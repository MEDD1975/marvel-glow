import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/connexion-medecin")({
  head: () => ({ meta: [{ title: "Connexion professionnel de santé — Kivoir" }] }),
  component: DoctorSignInPage,
});

const inputClass = "mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground outline-none focus:border-care";

function DoctorSignInPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"sign-in" | "forgot">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [cookieBlocked, setCookieBlocked] = useState(false);
  const { data: session } = authClient.useSession();
  const currentUser = session?.user;

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCookieBlocked(false);
    setPending(true);
    const result = await authClient.signIn.email({ email, password });
    setPending(false);
    if (result.error) {
      setError(result.error.status === 403 ? "Ce compte est désactivé. Contactez Kivoir." : "Email ou mot de passe incorrect.");
      return;
    }
    const { data: confirmedSession } = await authClient.getSession();
    if (!confirmedSession?.user) {
      setCookieBlocked(true);
      return;
    }
    await navigate({ to: "/cabinet" });
  }

  async function handleForgot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    await authClient.requestPasswordReset({ email, redirectTo: `${window.location.origin}/nouveau-mot-de-passe` });
    setPending(false);
    setNotice("Si un compte Kivoir existe pour cette adresse, un e-mail de réinitialisation vient d’être envoyé. Le lien est valable 1 heure.");
  }

  function switchMode(next: "sign-in" | "forgot") {
    setMode(next);
    setError("");
    setNotice("");
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10 md:py-16">
      <Link to="/" search={{ started: false }} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Retour à l’accueil
      </Link>
      <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-care/10 text-care">
          <LockKeyhole className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-care">Espace professionnel de santé</p>
        <h1 className="mt-2 text-3xl font-semibold text-foreground">{mode === "forgot" ? "Mot de passe oublié" : "Se connecter"}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {mode === "forgot"
            ? "Indiquez votre e-mail professionnel : vous recevrez un lien pour choisir un nouveau mot de passe."
            : "Accédez à vos parcours patient et à vos ressources validées."}
        </p>

        {currentUser && mode === "sign-in" ? (
          <div className="mt-6 rounded-2xl border border-care/20 bg-care/5 p-4">
            <p className="text-sm text-muted-foreground">Session déjà ouverte sur cet appareil :</p>
            <p className="mt-1 truncate font-semibold text-foreground">{currentUser.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => void navigate({ to: "/cabinet" })} className="min-h-11 rounded-xl bg-care px-4 text-sm font-semibold text-primary-foreground">
                Continuer avec ce compte
              </button>
              <button type="button" onClick={() => void authClient.signOut()} className="min-h-11 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground">
                Se déconnecter
              </button>
            </div>
          </div>
        ) : null}

        {mode === "sign-in" ? (
          <form className="mt-6 space-y-4" onSubmit={handleSignIn}>
            <label className="block text-sm font-medium text-foreground">
              Email professionnel
              <input className={inputClass} type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label className="block text-sm font-medium text-foreground">
              Mot de passe
              <input className={inputClass} type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
            {cookieBlocked ? (
              <div role="alert" className="rounded-xl border border-border bg-muted p-3 text-sm text-foreground">
                <p className="font-semibold">Identifiants acceptés, mais la session n&apos;a pas pu être conservée.</p>
                <p className="mt-1 text-muted-foreground">Votre navigateur bloque les cookies dans l&apos;aperçu intégré. Ouvrez cette page dans un nouvel onglet puis reconnectez-vous.</p>
                <a href="/connexion-medecin" target="_blank" rel="noopener" className="mt-2 inline-block font-semibold text-care hover:underline">Ouvrir dans un nouvel onglet</a>
              </div>
            ) : null}
            <button className="w-full rounded-xl bg-care px-4 py-3 font-semibold text-primary-foreground disabled:opacity-60" type="submit" disabled={pending}>
              {pending ? "Patientez…" : "Se connecter"}
            </button>
            <button type="button" className="w-full text-center text-sm font-semibold text-care hover:underline" onClick={() => switchMode("forgot")}>
              Mot de passe oublié ?
            </button>
          </form>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleForgot}>
            <label className="block text-sm font-medium text-foreground">
              Email professionnel
              <input className={inputClass} type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            {notice ? <p role="status" className="rounded-xl bg-care/5 p-3 text-sm text-foreground">{notice}</p> : null}
            <button className="w-full rounded-xl bg-care px-4 py-3 font-semibold text-primary-foreground disabled:opacity-60" type="submit" disabled={pending}>
              {pending ? "Envoi…" : "Recevoir le lien"}
            </button>
            <button type="button" className="w-full text-center text-sm font-semibold text-care hover:underline" onClick={() => switchMode("sign-in")}>
              Retour à la connexion
            </button>
          </form>
        )}

        <p className="mt-6 border-t border-border pt-4 text-center text-xs leading-5 text-muted-foreground">
          L’accès à Kivoir se fait sur invitation. Pour ouvrir un compte professionnel, contactez l’équipe Kivoir.
        </p>
      </section>
    </main>
  );
}
