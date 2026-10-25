import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { BookOpen, ChevronRight, Home, Menu, Users } from "lucide-react";
import { Logo } from "@/components/Logo";
import { contextLinkSearch, usePatient } from "@/components/patient/PatientProvider";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const menuGroups: Array<{ label: string; items: Array<{ to: string; hash?: string; label: string }> }> = [
  {
    label: "Mon espace",
    items: [
      { to: "/patient", label: "Accueil" },
      { to: "/patient/ressources", label: "Conseils et contenus" },
      { to: "/patient/surveiller", label: "Points à surveiller" },
      { to: "/patient/professionnels", label: "Qui contacter ?" },
    ],
  },
  {
    label: "Aide et informations",
    items: [
      { to: "/patient/faq", label: "Questions fréquentes" },
      { to: "/patient/infos/a-propos", label: "À propos de Kivoir" },
      { to: "/patient/infos/conditions", label: "Conditions d'utilisation" },
      { to: "/patient/infos/confidentialite", label: "Confidentialité" },
      { to: "/patient/infos/accessibilite", label: "Accessibilité" },
    ],
  },
  {
    label: "Professionnels de santé",
    items: [{ to: "/connexion-medecin", label: "Espace professionnel de santé" }],
  },
];

const isHome = (path: string) => path === "/" || path === "/patient" || path === "/patient/";
const isAdvice = (path: string) => path.startsWith("/conseils") || /^\/patient\/(recommandations|surveiller|ressources)/.test(path);
const isPros = (path: string) => path.startsWith("/annuaire") || path.startsWith("/patient/professionnels");
const tabs = [
  { to: "/patient", label: "Accueil", icon: Home, match: isHome },
  { to: "/patient/ressources", label: "Conseils et contenus", icon: BookOpen, match: isAdvice },
  { to: "/patient/professionnels", label: "Qui contacter ?", icon: Users, match: isPros },
];

const desktopLinks = [
  ...tabs,
];

function useLinkSearch() {
  const { context } = usePatient();
  return contextLinkSearch(context) as never;
}

export function KivoirHeader() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const linkSearch = useLinkSearch();
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-12 max-w-3xl items-center justify-between gap-4 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] md:h-14">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/patient" search={linkSearch} aria-label="Kivoir, retour à l'accueil" className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Logo size="sm" />
          </Link>
          <p className="flex min-w-0 items-center gap-1.5 text-[10px] font-semibold tracking-wide text-[#526176] sm:gap-2 sm:text-xs" aria-label="Les repères Kivoir">
            <span>Quoi faire</span><span className="text-[#B6C4D5]" aria-hidden="true">·</span><span>Quand</span><span className="text-[#B6C4D5]" aria-hidden="true">·</span><span>Qui voir</span>
          </p>
        </div>
        <nav aria-label="Navigation principale" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {desktopLinks.map((link) => {
              const active = link.match(pathname);
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    search={linkSearch}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      active ? "bg-tone-blue text-care" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            aria-label="Ouvrir le menu"
            className="-mr-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[86%] max-w-sm overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription className="sr-only">Navigation de l'espace patient</SheetDescription>
            </SheetHeader>
            <nav aria-label="Menu" className="mt-2 flex flex-col gap-6 px-4 pb-8">
              {menuGroups.map((group) => (
                <div key={group.label}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.label}</p>
                  <ul className="divide-y divide-border/70 overflow-hidden rounded-xl border border-border/70">
                    {group.items.map((item) => (
                      <li key={`${item.to}#${item.hash ?? ""}`}>
                        <Link
                          to={item.to}
                          search={linkSearch}
                          {...(item.hash ? { hash: item.hash } : {})}
                          onClick={() => setOpen(false)}
                          className="flex min-h-12 items-center justify-between px-3 text-sm font-medium text-foreground hover:bg-accent"
                        >
                          {item.label}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <Link
                to="/patient"
                search={linkSearch}
                onClick={() => setOpen(false)}
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-tone-blue px-4 text-sm font-semibold text-care hover:bg-tone-blue/70"
              >
                Retour à l'accueil
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export function BottomNavigation() {
  const { pathname } = useLocation();
  const linkSearch = useLinkSearch();
  return (
    <nav aria-label="Navigation mobile" className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-card/80 md:hidden print:hidden">
      <ul className="mx-auto grid max-w-2xl grid-cols-3">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <li key={tab.to}>
              <Link
                to={tab.to}
                search={linkSearch}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
                  active ? "text-care" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" strokeWidth={active ? 2.4 : 2} />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
