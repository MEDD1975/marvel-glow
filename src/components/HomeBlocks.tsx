import { AlertTriangle, ArrowRight, ClipboardCheck, MapPin, PlayCircle, Stethoscope } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const medicalDisclaimer = "Cette application informe et ne remplace pas un avis médical. En cas de doute, consultez un professionnel de santé.";

export function MedicalDisclaimer({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-urgent/20 bg-urgent/5 p-4 text-sm text-foreground ${className}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-urgent" aria-hidden="true" />
        <p>{medicalDisclaimer}</p>
      </div>
    </div>
  );
}

export function EntryCard({
  to,
  icon: Icon,
  title,
  description,
  tone,
}: {
  to: string;
  icon: React.ElementType;
  title: string;
  description: string;
  tone: "care" | "urgent" | "soothe";
}) {
  const toneClasses = {
    care: "bg-care/10 text-care group-hover:bg-care/15",
    urgent: "bg-urgent/10 text-urgent group-hover:bg-urgent/15",
    soothe: "bg-soothe/30 text-soothe-foreground group-hover:bg-soothe/40",
  };

  return (
    <Link
      to={to}
      className="group flex min-h-36 flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-care/40 hover:shadow-md"
    >
      <div className={`flex size-11 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
        <Icon aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-card-foreground">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-care">
        Ouvrir <ArrowRight aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

export type HomeSource = "affiche" | "carte" | "direct";

const sourceIntro: Record<HomeSource, { badge: string; title: string; lead: string }> = {
  affiche: { badge: "Questionnaire en salle d’attente", title: "Préparez votre consultation", lead: "Décrivez votre douleur en quelques minutes. Votre médecin retrouve une synthèse claire avant l’échange." },
  carte: { badge: "Votre parcours de soins", title: "Comprenez quoi faire maintenant", lead: "Des repères simples pour avancer sereinement." },
  direct: { badge: "Votre accès Kivoir", title: "Retrouvez votre parcours de soin", lead: "Votre professionnel vous remet un lien Kivoir pour retrouver le parcours correspondant à votre diagnostic." },
};

export function HomeHero({ source = "direct" }: { source?: HomeSource }) {
  const intro = sourceIntro[source];
  const carteFirst = source === "carte";

  return (
    <section className="px-4 pb-10 pt-10 md:pb-16 md:pt-16">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-care/20 bg-care/5 px-3 py-1 text-xs font-semibold text-care">
            <Stethoscope aria-hidden="true" />
            Kivoir · Qui voir, quand
          </span>
          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-6xl">Votre parcours de soin, enfin lisible.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground md:text-xl">Comprenez où vous en êtes, préparez votre prochain échange et retrouvez ce que votre professionnel vous a recommandé.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground" aria-label="Repères Kivoir">
            <span>Comprendre</span><span>Savoir qui voir</span><span>Préparer la consultation</span>
          </div>
        </div>

        <div className="mt-14">
          <p className="mb-5 text-center text-base font-semibold text-muted-foreground">Pour commencer</p>
          <div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2">
          <Link to="/orientation" className="group flex min-h-64 flex-col gap-5 rounded-[2rem] border border-care/25 bg-card p-7 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-care/50 hover:shadow-md">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-care/10 text-care"><ClipboardCheck aria-hidden="true" className="size-6" /></span>
            <div><h2 className="text-xl font-semibold tracking-tight text-card-foreground">Je remplis le questionnaire</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Je décris ma douleur avant de rencontrer le médecin.</p></div>
            <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-care">Commencer <ArrowRight aria-hidden="true" /></span>
          </Link>
          <Link to="/parcours" className="group flex min-h-64 flex-col gap-5 rounded-[2rem] border border-border bg-card p-7 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-care/50 hover:shadow-md">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-care"><Stethoscope aria-hidden="true" className="size-6" /></span>
            <div><h2 className="text-xl font-semibold tracking-tight text-card-foreground">Je découvre Kivoir</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Je n’ai pas encore de parcours attribué par un professionnel.</p></div>
            <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-care">Comprendre le fonctionnement <ArrowRight aria-hidden="true" /></span>
          </Link>
          </div>
        </div>

        <Link to="/cabinet" className="group mt-10 flex min-h-24 flex-col justify-center rounded-2xl border border-border bg-secondary/40 p-6 text-left transition-all hover:border-care/40 hover:bg-care-muted/20 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div><p className="text-base font-semibold text-care">Je suis professionnel de santé</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Préparer la consultation. Prolonger les conseils.</p></div>
          <span className="mt-3 inline-flex items-center gap-2 text-base font-semibold text-care sm:mt-0">Espace cabinet <ArrowRight aria-hidden="true" className="transition-transform group-hover:translate-x-1" /></span>
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span>3 minutes</span><span>Sans compte</span><span>Aucune donnée enregistrée</span>
        </div>
      </div>
    </section>
  );
}

export function EntryGrid() {
  return (
    <section className="px-4 pb-12 md:pb-16">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-4 text-sm font-semibold text-muted-foreground">Besoin d&apos;une autre aide ?</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <EntryCard to="/conseils" icon={PlayCircle} title="Repères et conseils" description="Des informations générales pour préparer vos échanges." tone="soothe" />
          <EntryCard to="/annuaire" icon={MapPin} title="Trouver un professionnel" description="Les ressources utiles près de chez vous." tone="care" />
        </div>
      </div>
    </section>
  );
}
