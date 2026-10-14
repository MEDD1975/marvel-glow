import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { BookOpen, ChevronRight, Home, Menu, Users } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const menuGroups: Array<{ label: string; items: Array<{ to: string; label: string }> }> = [
  {
    label: "Mon espace",
    items: [
      { to: "/patient", label: "Accueil" },
      { to: "/patient/parcours", label: "Mon parcours" },
      { to: "/patient/recommandations", label: "Mes conseils" },
      { to: "/patient/ressources", label: "Mes ressources" },
      { to: "/patient/professionnels", label: "Professionnels recommandés" },
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
];

export function KivoirHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <Link to="/patient" aria-label="Kivoir, retour à l'accueil" className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Logo size="sm" />
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            aria-label="Ouvrir le menu"
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-xl text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[86%] max-w-sm overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription className="sr-only">Navigation de l'espace patient</SheetDescription>
            </SheetHeader>
            <nav aria-label="Menu principal" className="mt-2 flex flex-col gap-6 px-4 pb-8">
              {menuGroups.map((group) => (
                <div key={group.label}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.label}</p>
                  <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                    {group.items.map((item) => (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          onClick={() => setOpen(false)}
                          className="flex min-h-12 items-center justify-between px-3 text-sm font-medium text-foreground hover:bg-accent"
                          activeOptions={{ exact: true }}
                          activeProps={{ className: "text-care" }}
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
                onClick={() => setOpen(false)}
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
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

const tabs = [
  { to: "/patient", label: "Accueil", icon: Home, match: (path: string) => path === "/patient" || path === "/patient/" },
  { to: "/patient/recommandations", label: "Mes conseils", icon: BookOpen, match: (path: string) => /^\/patient\/(recommandations|surveiller|ressources|parcours)/.test(path) },
  { to: "/patient/professionnels", label: "Professionnels", icon: Users, match: (path: string) => path.startsWith("/patient/professionnels") },
];

export function BottomNavigation() {
  const { pathname } = useLocation();
  return (
    <nav aria-label="Navigation principale" className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur print:hidden">
      <ul className="mx-auto grid max-w-2xl grid-cols-3">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <li key={tab.to}>
              <Link
                to={tab.to}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
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
