import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="flex items-center gap-2 text-foreground">
          <Logo size="md" showTagline />
        </Link>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <Link
            to="/"
            activeProps={{ className: "font-medium text-foreground" }}
            inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
            activeOptions={{ exact: true }}
          >
            Accueil
          </Link>
          <Link
            to="/orientation"
            activeProps={{ className: "font-medium text-foreground" }}
            inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
          >
            Orientation
          </Link>
          <Link
            to="/parcours"
            activeProps={{ className: "font-medium text-foreground" }}
            inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
          >
            Parcours
          </Link>
          <Link
            to="/conseils"
            activeProps={{ className: "font-medium text-foreground" }}
            inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
          >
            Conseils
          </Link>
          <Link
            to="/cabinet"
            activeProps={{ className: "font-medium text-foreground" }}
            inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
          >
            Cabinet
          </Link>
        </nav>
      </div>
    </header>
  );
}
