import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Inbox, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({ title, description, action, className }: { title: string; description?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center", className)}>
      <Inbox className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      <p className="font-semibold text-foreground">{title}</p>
      {description ? <p className="max-w-md text-sm leading-6 text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function LoadingState({ label = "Chargement…" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-6 py-10 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
      <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />{message}</span>
      {onRetry ? <button type="button" onClick={onRetry} className="min-h-11 rounded-lg border border-destructive/30 bg-card px-4 font-medium">Réessayer</button> : null}
    </div>
  );
}

export type SaveState = { status: "idle" | "saving" | "saved" | "error"; message?: string };

export function SaveStatus({ state }: { state: SaveState }) {
  if (state.status === "idle") return null;
  if (state.status === "saving") {
    return <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />Enregistrement en cours…</p>;
  }
  if (state.status === "saved") {
    return <p role="status" className="flex items-center gap-2 text-sm font-medium text-emerald-700"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />{state.message ?? "Modifications enregistrées."}</p>;
  }
  return <p role="alert" className="flex items-center gap-2 text-sm font-medium text-destructive"><AlertCircle className="h-4 w-4" aria-hidden="true" />{state.message ?? "Erreur d’enregistrement."}</p>;
}
