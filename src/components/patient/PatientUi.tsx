import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AlertTriangle, ArrowLeft, ChevronRight, Info, Loader2, RefreshCw, SearchX, type LucideIcon } from "lucide-react";

export type Tone = "blue" | "green" | "orange" | "red" | "violet";

const toneClasses: Record<Tone, { card: string; icon: string }> = {
  blue: { card: "border-care/10 bg-tone-blue/70", icon: "bg-card/80 text-care" },
  green: { card: "border-tone-green-border/20 bg-tone-green/70", icon: "bg-card/80 text-tone-green-text" },
  orange: { card: "border-tone-orange-border/25 bg-tone-orange/70", icon: "bg-card/80 text-tone-orange-text" },
  red: { card: "border-tone-red-border/30 bg-tone-red", icon: "bg-card/80 text-tone-red-text" },
  violet: { card: "border-tone-violet-border/20 bg-tone-violet/70", icon: "bg-card/80 text-tone-violet-text" },
};

export function PageHeading({ title, description, back }: { title: string; description?: string | undefined; back?: { to: string; label: string } | undefined }) {
  return (
    <div className="mb-7">
      {back ? (
        <Link
          to={back.to}
          className="-ml-2 mb-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {back.label}
        </Link>
      ) : null}
      <h1 className="text-balance text-[1.625rem] font-semibold leading-tight tracking-tight text-foreground">{title}</h1>
      {description ? <p className="mt-2 line-clamp-4 text-pretty text-[0.9375rem] leading-relaxed text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export function ActionCard({
  to,
  icon: Icon,
  title,
  description,
  tone,
  search,
  hash,
}: {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
  tone: Tone;
  search?: Record<string, string> | undefined;
  hash?: string;
}) {
  const classes = toneClasses[tone];
  return (
    <Link
      to={to}
      {...(search ? { search } : {})}
      {...(hash ? { hash } : {})}
      className={`flex min-h-16 items-center gap-3.5 rounded-2xl border px-4 py-3 transition-colors hover:brightness-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${classes.card}`}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${classes.icon}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.9375rem] font-semibold leading-snug text-foreground">{title}</span>
        <span className="mt-0.5 line-clamp-2 block text-sm leading-snug text-muted-foreground">{description}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/70" aria-hidden="true" />
    </Link>
  );
}

export function DecisionCard({
  to,
  hash,
  icon: Icon,
  step,
  title,
  description,
  action,
  tone,
}: {
  to: string;
  hash?: string;
  icon: LucideIcon;
  step: number;
  title: string;
  description: string;
  action: string;
  tone: Tone;
}) {
  const classes = toneClasses[tone];
  return (
    <Link
      to={to}
      {...(hash ? { hash } : {})}
      className={`group flex flex-col gap-3 rounded-2xl border p-4 transition-colors md:flex-row md:items-center md:justify-between md:gap-6 hover:brightness-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${classes.card}`}
    >
      <span className="flex items-start gap-3.5">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${classes.icon}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-medium text-muted-foreground">{`Étape ${step}`}</span>
          <span className="block text-base font-semibold leading-snug text-foreground">{title}</span>
          <span className="mt-1 block text-sm leading-snug text-muted-foreground">{description}</span>
        </span>
      </span>
      <span className="inline-flex min-h-11 shrink-0 items-center justify-between gap-2 rounded-xl bg-card/90 px-4 text-sm font-semibold text-care">
        {action}
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  );
}

export function ListRow({ to, params, title, description, leading }: { to: string; params?: Record<string, string>; title: string; description?: string | undefined; leading?: ReactNode }) {
  return (
    <Link
      to={to}
      {...(params ? { params } : {})}
      className="flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
    >
      {leading}
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-foreground">{title}</span>
        {description ? <span className="mt-0.5 line-clamp-2 block text-sm leading-snug text-muted-foreground">{description}</span> : null}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/70" aria-hidden="true" />
    </Link>
  );
}

export function ListGroup({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <ul aria-label={label} className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-card">
      {children}
    </ul>
  );
}

export function SafetyNotice({ children }: { children?: ReactNode }) {
  return (
    <p className="flex items-start gap-2.5 rounded-xl bg-muted px-4 py-3 text-sm leading-relaxed text-muted-foreground">
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children ?? "Ces informations ne remplacent pas un avis médical. En cas de doute, contactez votre professionnel de santé."}</span>
    </p>
  );
}

export function ValidationNote({ validatedAt, validatedBy, source }: { validatedAt: string | undefined; validatedBy: string | undefined; source: string | undefined }) {
  if (validatedAt) {
    return (
      <p className="text-xs text-muted-foreground">
        {`Contenu validé${validatedBy ? ` par ${validatedBy}` : ""} le ${validatedAt}${source ? ` · Source : ${source}` : ""}`}
      </p>
    );
  }
  return <p className="text-xs text-muted-foreground">Contenu de démonstration, en attente de validation médicale.</p>;
}

export function LoadingState({ label = "Chargement…" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-10 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      {label}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center">
      <SearchX className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      <p className="mt-3 font-medium text-foreground">{title}</p>
      {description ? <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-2xl border border-tone-red-border/40 bg-tone-red px-5 py-8 text-center text-tone-red-text">
      <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      <p className="mt-3 text-sm font-medium">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-card px-4 text-sm font-semibold text-foreground"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Réessayer
        </button>
      ) : null}
    </div>
  );
}

export function NoPathwayState() {
  return (
    <EmptyState
      title="Aucun parcours ouvert"
      description="Scannez le QR code remis par votre cabinet pour ouvrir votre parcours."
    />
  );
}

export function FreeChoiceNotice() {
  return (
    <p className="mt-6 flex items-start gap-2.5 rounded-xl bg-muted px-4 py-3 text-sm leading-relaxed text-muted-foreground">
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>Vous restez libre de choisir le professionnel de santé de votre choix. Cette liste est fournie à titre indicatif.</span>
    </p>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-3 mt-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{children}</h2>;
}
