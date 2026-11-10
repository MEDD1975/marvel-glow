import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { ArrowLeft, Dumbbell } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/connexion-kine")({
  head: () => ({ meta: [{ title: "Connexion kinésithérapeute — Kivoir" }] }),
  component: KineSignInPage,
});

function KineSignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const result = await authClient.signIn.email({ email, password });
    if (result.error) {
      setError(result.error.status === 403 ? "Ce compte est désactivé. Contactez Kivoir." : "Email ou mot de passe incorrect.");
      setPending(false);
      return;
    }
    const { data: session } = await authClient.getSession();
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (role !== "kine" && role !== "kinesitherapeute" && role !== "admin_kivoir") {
      await authClient.signOut();
      setError("Cette connexion est réservée aux comptes kinésithérapeutes.");
      setPending(false);
      return;
    }
    await navigate({ to: "/cabinet/kine" });
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10 md:py-16">
      <Link to="/" search={{ started: false }} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Retour à l’accueil</Link>
      <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#177e78]/10 text-[#177e78]"><Dumbbell className="h-6 w-6" aria-hidden="true" /></div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-[#177e78]">Espace kinésithérapeute</p>
        <h1 className="mt-2 text-3xl font-semibold text-foreground">Se connecter</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Accédez à votre bibliothèque et prolongez vos séances à la maison.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-foreground">Email professionnel<input className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground outline-none focus:border-[#177e78]" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label className="block text-sm font-medium text-foreground">Mot de passe<input className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground outline-none focus:border-[#177e78]" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
          <button className="w-full rounded-xl bg-[#177e78] px-4 py-3 font-semibold text-white disabled:opacity-60" type="submit" disabled={pending}>{pending ? "Patientez…" : "Se connecter"}</button>
        </form>
        <p className="mt-6 border-t border-border pt-4 text-center text-xs leading-5 text-muted-foreground">L’accès kiné se fait sur invitation. Pour ouvrir un compte, contactez l’équipe Kivoir.</p>
        <Link to="/connexion-medecin" className="mt-4 block text-center text-sm font-semibold text-care hover:underline">Connexion espace médecin</Link>
      </section>
    </main>
  );
}
