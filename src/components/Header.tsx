import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";

const patientNavItems = [
  { to: "/", label: "Accueil", exact: true },
  { to: "/parcours", label: "Parcours" },
  { to: "/annuaire", label: "Annuaire" },
];

const doctorNavItems = [{ to: "/cabinet", label: "Gestion et annuaire", exact: true }];

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isDoctorSpace = location.pathname.startsWith("/cabinet");
  const navItems = isDoctorSpace ? doctorNavItems : patientNavItems;

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl print:hidden">
      <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:flex sm:justify-between">
        <Link to="/" className="flex min-w-0 items-center gap-2 text-foreground" onClick={() => setOpen(false)}>
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
              activeProps={{ className: "font-medium text-foreground" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
              activeOptions={{ exact: item.exact ?? false }}
            >
              {item.label}
            </Link>
          ))}
          </nav>
          <Link
            to={isDoctorSpace ? "/" : "/cabinet"}
            className="rounded-full border border-care/25 px-3 py-1.5 text-xs font-semibold text-care transition-colors hover:bg-care/10"
          >
            {isDoctorSpace ? "Espace patient" : "Espace médecin"}
          </Link>
        </div>

        {open && (
        <nav className="border-t border-border bg-background px-4 py-2 sm:hidden">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              activeProps={{ className: "bg-care/10 font-semibold text-care" }}
              inactiveProps={{ className: "text-foreground hover:bg-muted" }}
              activeOptions={{ exact: item.exact ?? false }}
              className="block rounded-lg px-3 py-3 text-base"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to={isDoctorSpace ? "/" : "/cabinet"}
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-lg border border-care/20 px-3 py-3 text-base font-semibold text-care"
          >
            {isDoctorSpace ? "Espace patient" : "Espace médecin"}
          </Link>
        </nav>
        )}
      </div>
    </header>
  );
}
