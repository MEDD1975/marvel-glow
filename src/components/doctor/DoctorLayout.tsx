import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Building2, CheckCircle2, FolderOpen, HelpCircle, LayoutGrid, LogOut, QrCode, ShieldCheck, Users } from "lucide-react";
import { Logo } from "@/components/Logo";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/cabinet", label: "Transmettre un parcours", short: "Transmettre", icon: QrCode, exact: true },
  { to: "/cabinet/parcours", label: "Mes parcours TMS", short: "Parcours", icon: LayoutGrid },
  { to: "/cabinet/ressources", label: "Mes ressources", short: "Ressources", icon: FolderOpen },
  { to: "/cabinet/conseils", label: "Conseils à appliquer", short: "Conseils", icon: CheckCircle2 },
  { to: "/cabinet/professionnels", label: "Professionnels", short: "Pros", icon: Users },
  { to: "/cabinet/mon-cabinet", label: "Mon cabinet", short: "Cabinet", icon: Building2 },
] as const;

function useIsActive() {
  const pathname = useLocation().pathname.replace(/\/$/, "") || "/";
  return (to: string, exact?: boolean) => (exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`));
}

function ConnectedAccount({ compact = false }: { compact?: boolean }) {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const role = (user as typeof user & { role?: string } | undefined)?.role;
  if (!user) return null;
  if (compact) {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <p className="min-w-0 truncate text-xs text-muted-foreground">
          <span className="sr-only">Connecté en tant que </span>
          {user.email}
        </p>
        {role === "admin_kivoir" ? <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-care/10 px-2 py-1 text-[10px] font-semibold text-care"><ShieldCheck className="h-3 w-3" aria-hidden="true" />Admin</span> : null}
      </div>
    );
  }
  return (
    <div className="min-w-0 rounded-xl bg-muted/60 px-3 py-2">
      <p className="text-xs text-muted-foreground">Connecté en tant que</p>
      <p className="truncate text-sm font-medium text-foreground">{user.name || user.email}</p>
      {user.name ? <p className="truncate text-xs text-muted-foreground">{user.email}</p> : null}
      {role === "admin_kivoir" ? <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-care/10 px-2 py-1 text-[11px] font-semibold text-care"><ShieldCheck className="h-3 w-3" aria-hidden="true" />Administrateur principal</span> : null}
    </div>
  );
}

function useSessionRole() {
  const { data: session } = authClient.useSession();
  return (session?.user as { role?: string } | null | undefined)?.role;
}

function useSignOut() {
  const navigate = useNavigate();
  return async () => {
    await authClient.signOut();
    await navigate({ to: "/connexion-medecin" });
  };
}

export function DoctorSidebar() {
  const isActive = useIsActive();
  const signOut = useSignOut();
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-card print:hidden md:flex">
      <Link to="/cabinet" className="px-5 pb-4 pt-5 text-foreground">
        <Logo size="sm" />
        <span className="mt-1 block text-xs font-medium text-muted-foreground">Espace professionnel de santé</span>
      </Link>
      <nav aria-label="Espace professionnel de santé" className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const active = isActive(item.to, "exact" in item ? item.exact : false);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors",
                active ? "bg-care font-semibold text-care-foreground shadow-sm" : "text-muted-foreground hover:bg-care/10 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex flex-col gap-1 border-t border-border p-3">
        <ConnectedAccount />
        {useSessionRole() === "admin_kivoir" ? <Link to="/admin/medecins" className="flex min-h-11 items-center gap-3 rounded-xl bg-care/10 px-3 text-sm font-semibold text-care hover:bg-care/15"><ShieldCheck className="h-4 w-4" aria-hidden="true" />Administration</Link> : null}
        <Link
          to="/cabinet/aide"
          aria-current={isActive("/cabinet/aide") ? "page" : undefined}
          className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm", isActive("/cabinet/aide") ? "bg-care/10 font-semibold text-care" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
        >
          <HelpCircle className="h-4 w-4" aria-hidden="true" />
          Aide
        </Link>
        <button type="button" onClick={() => void signOut()} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

function DoctorMobileBar() {
  const isActive = useIsActive();
  const signOut = useSignOut();
  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b border-border bg-card/95 px-4 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur print:hidden md:hidden">
        <div className="flex min-w-0 flex-col">
          <Link to="/cabinet" className="text-foreground"><Logo size="sm" /></Link>
          <ConnectedAccount compact />
          {useSessionRole() === "admin_kivoir" ? <Link to="/admin/medecins" className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-care/10 px-2 py-1 text-[10px] font-semibold text-care"><ShieldCheck className="h-3 w-3" aria-hidden="true" />Administration</Link> : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Link to="/cabinet/aide" aria-label="Aide" className={cn("flex h-11 w-11 items-center justify-center rounded-xl", isActive("/cabinet/aide") ? "bg-care/10 text-care" : "text-muted-foreground")}>
            <HelpCircle className="h-5 w-5" aria-hidden="true" />
          </Link>
          <button type="button" onClick={() => void signOut()} aria-label="Déconnexion" className="flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground">
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </header>
      <nav aria-label="Espace professionnel de santé" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur print:hidden md:hidden">
        {navItems.map((item) => {
          const active = isActive(item.to, "exact" in item ? item.exact : false);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
              className={cn("flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium", active ? "text-care" : "text-muted-foreground")}
            >
              <span className={cn("flex h-7 w-12 items-center justify-center rounded-full", active && "bg-care/15")}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              {item.short}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export function DoctorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-[color-mix(in_oklab,var(--care-muted)_45%,var(--background))] print:block print:bg-background">
      <DoctorSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DoctorMobileBar />
        <div className="flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0 print:pb-0">{children}</div>
      </div>
    </div>
  );
}

export function DoctorHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="text-sm font-medium text-care">{eyebrow}</p> : null}
        <h1 className="mt-1 text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-pretty text-sm leading-6 text-muted-foreground md:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function DoctorPage({ children }: { children: ReactNode }) {
  return <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 md:py-8 lg:px-8 print:p-0">{children}</main>;
}
