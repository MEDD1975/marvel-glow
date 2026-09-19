import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Users } from "lucide-react";

function DoctorIntro({ onStart }: { onStart: () => void }) {
  return (
    <section className="flex justify-center px-4 py-6 md:px-8 md:py-10">
      <div className="w-full max-w-2xl rounded-[2rem] border border-care/20 bg-card px-6 py-10 text-center shadow-xl shadow-care/10 md:px-12 md:py-16">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border border-care/20 bg-care/10 p-5">
          <img src="/favicon.svg" alt="" className="h-full w-full" />
        </div>
        <p className="mt-7 text-sm font-semibold uppercase tracking-[0.16em] text-care">Espace médecin</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-[-0.05em] text-foreground md:text-7xl">Kivoir</h1>
        <p className="mx-auto mt-5 max-w-md text-pretty text-lg leading-8 text-muted-foreground md:text-xl">Préparez simplement les contenus et les ressources à partager avec vos patients.</p>
        <button type="button" onClick={onStart} className="mt-9 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Commencer</button>
      </div>
    </section>
  );
}

export function DoctorHome() {
  const [hasStarted, setHasStarted] = useState(false);

  if (!hasStarted) {
    return <DoctorIntro onStart={() => setHasStarted(true)} />;
  }

  return (
    <main className="flex flex-col items-stretch justify-start px-4 pt-6 pb-12 md:px-8 lg:pt-8">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-care">Espace médecin</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Que souhaitez-vous faire ?</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Accédez rapidement aux outils nécessaires pour accompagner vos patients après la consultation.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Link to="/annuaire" className="group flex min-h-52 flex-col rounded-3xl border border-care/30 bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-care hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-care/10 text-care"><Users className="h-6 w-6" aria-hidden="true" /></span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-care">1 - RÉSEAU PROFESSIONNEL</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">Gérer votre réseau</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">Ajoutez et mettez à jour les professionnels que vos patients pourront retrouver.</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-care">Ouvrir <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
          </Link>
          <Link to="/cabinet" className="group flex min-h-52 flex-col rounded-3xl border border-care/30 bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-care hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-care/10 text-care"><FileText className="h-6 w-6" aria-hidden="true" /></span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-care">BIBLIOTHÈQUE DE CONTENUS</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">Créer et partager des contenus</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">Ajoutez les vidéos, fichiers et ressources destinés à vos patients.</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-care">Ouvrir <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
          </Link>
          <Link to="/" className="group flex min-h-52 flex-col rounded-3xl border border-care/30 bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-care hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-care/10 text-care"><FileText className="h-6 w-6" aria-hidden="true" /></span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-care">3 - APERÇU PATIENT</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">Voir l’expérience patient</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">Prévisualisez les contenus et le parcours que votre patient découvrira après la consultation.</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-care">Voir l’expérience patient <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
          </Link>
        </div>
      </section>
    </main>
  );
}
