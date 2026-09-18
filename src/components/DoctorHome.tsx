import { Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Users } from "lucide-react";

export function DoctorHome() {
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
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-care">1 · Réseau professionnel</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">Gérer votre réseau</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">Ajoutez et mettez à jour les professionnels que vos patients pourront retrouver.</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-care">Ouvrir <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
          </Link>
          <Link to="/cabinet" className="group flex min-h-52 flex-col rounded-3xl border border-care/30 bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-care hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-care/10 text-care"><FileText className="h-6 w-6" aria-hidden="true" /></span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-care">2 · Bibliothèque de contenus</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">Créer et partager des contenus</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">Ajoutez les vidéos, fichiers et ressources destinés à vos patients.</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-care">Ouvrir <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
          </Link>
          <div className="flex min-h-52 flex-col rounded-3xl border border-border bg-muted/30 p-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><FileText className="h-6 w-6" aria-hidden="true" /></span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-care">3 · Aperçu patient</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">Voir l’expérience patient</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">Prévisualisez les contenus et le parcours que votre patient découvrira après la consultation.</p>
            <Link to="/" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-care">Voir l’aperçu <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
