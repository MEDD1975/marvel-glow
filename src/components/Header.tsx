import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";

const patientNavItems = [
  { to: "/", label: "Accueil", exact: true },
  { to: "/annuaire", label: "Réseau de votre médecin" },
];

const doctorNavItems = [
  { to: "/cabinet/accueil", label: "Accueil", exact: true },
  { to: "/cabinet", label: "Bibliothèque de contenus", exact: true },
  { to: "/annuaire", label: "Réseau professionnel" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isDoctorLogin = location.pathname.startsWith("/connexion-medecin");
  const isDoctorSpace = location.pathname.startsWith("/cabinet") || isDoctorLogin;
  const navItems = isDoctorSpace ? doctorNavItems : patientNavItems;

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl print:hidden">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:flex sm:justify-between sm:px-6 lg:px-8">
        <Link to={isDoctorSpace ? "/cabinet/accueil" : "/"} className="flex min-w-0 items-center gap-2 text-foreground" onClick={() => setOpen(false)}>
          <Logo size="md" showTagline />
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          className="shrink-0 rounded-lg border border-border p-2 text-foreground sm:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className="hidden items-center gap-4 sm:flex">
          <nav className="flex items-center gap-x-4 gap-y-1 text-sm">
            {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact ?? false }}
              aria-current={(item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)) ? "page" : undefined}
              className={
                (item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to))
                  ? "rounded-full border-2 border-care bg-care/10 px-3 py-1.5 font-bold text-foreground shadow-sm"
                  : "rounded-full border border-transparent px-3 py-1.5 text-muted-foreground transition-colors hover:border-border hover:text-foreground"
              }
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          </nav>
          <Link
            to={isDoctorSpace ? "/" : "/connexion-medecin"}
            className={
              isDoctorSpace
                ? "rounded-full border border-care/25 px-3 py-1.5 text-xs font-semibold text-foreground"
                : "rounded-full border border-transparent px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
            }
          >
            {isDoctorSpace ? "Quitter l’espace médecin" : "Accéder à l’espace médecin"}
          </Link>
        </div>

        {open && (
        <nav className="border-t border-border bg-background px-4 py-2 sm:hidden">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: item.exact ?? false }}
              aria-current={(item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)) ? "page" : undefined}
              className={
                (item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to))
                  ? "block rounded-lg border-2 border-care bg-care/10 px-3 py-3 text-base font-bold text-care"
                  : "block rounded-lg border border-transparent px-3 py-3 text-base text-foreground hover:bg-muted"
              }
            >
              {item.label}
            </Link>
          ))}
          <Link
            to={isDoctorSpace ? "/" : "/connexion-medecin"}
            onClick={() => setOpen(false)}
            className={
              isDoctorSpace
                ? "mt-2 block rounded-lg border border-care/25 bg-care/10 px-3 py-3 text-base font-semibold text-care"
                : "mt-2 block rounded-lg border border-transparent px-3 py-3 text-base font-semibold text-muted-foreground hover:bg-muted"
            }
          >
            {isDoctorSpace ? "Quitter l’espace médecin" : "Accéder à l’espace médecin"}
          </Link>
        </nav>
        )}
      </div>
    </header>
  );
}
