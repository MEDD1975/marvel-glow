import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/connexion-medecin")({
  component: DoctorSignInPage,
});

function DoctorSignInPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (event.nativeEvent.isComposing || (event as unknown as KeyboardEvent).keyCode === 229) return;
    setError("");
    setPending(true);
    const result = mode === "sign-up"
      ? await authClient.signUp.email({ name, email, password })
      : await authClient.signIn.email({ email, password });
    setPending(false);
    if (result.error) {
      setError(mode === "sign-up" ? "Impossible de créer ce compte. Vérifiez vos informations." : "Email ou mot de passe incorrect.");
      return;
    }
    await navigate({ to: "/cabinet" });
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10 md:py-16">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Retour à l’accueil
      </Link>
      <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-care/10 text-care">
          <LockKeyhole className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-care">Espace médecin</p>
        <h1 className="mt-2 text-3xl font-semibold text-foreground">{mode === "sign-up" ? "Créer votre compte" : "Se connecter"}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Accédez à vos cartes patient et à vos ressources validées.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {mode === "sign-up" ? (
            <label className="block text-sm font-medium text-foreground">
              Nom du médecin ou du cabinet
              <input className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground outline-none focus:border-care" type="text" autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} />
            </label>
          ) : null}
          <label className="block text-sm font-medium text-foreground">
            Email professionnel
            <input className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground outline-none focus:border-care" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Mot de passe
            <input className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground outline-none focus:border-care" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
          <button className="w-full rounded-xl bg-care px-4 py-3 font-semibold text-primary-foreground disabled:opacity-60" type="submit" disabled={pending}>
            {pending ? "Patientez…" : mode === "sign-up" ? "Créer mon compte" : "Se connecter"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "sign-up" ? "Vous avez déjà un compte ?" : "Première utilisation ?"}{" "}
          <button type="button" className="font-semibold text-care hover:underline" onClick={() => { setMode(mode === "sign-up" ? "sign-in" : "sign-up"); setError(""); }}>
            {mode === "sign-up" ? "Se connecter" : "Créer un compte"}
          </button>
        </p>
      </section>
    </main>
  );
}
