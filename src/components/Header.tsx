import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";

const navItems = [
  { to: "/", label: "Accueil", exact: true },
  { to: "/orientation", label: "Orientation" },
  { to: "/parcours", label: "Parcours" },
  { to: "/annuaire", label: "Près de chez moi" },
  { to: "/conseils", label: "Conseils" },
  { to: "/cabinet", label: "Cabinet" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur print:hidden">
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

        <nav className="hidden items-center gap-x-4 gap-y-1 text-sm sm:flex sm:flex-wrap">
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
        </nav>
      )}
    </header>
  );
}
