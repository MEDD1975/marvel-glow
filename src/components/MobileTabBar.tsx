import { Link } from "@tanstack/react-router";
import { Home, ClipboardList, Route as RouteIcon, MapPin, PlayCircle } from "lucide-react";

const items = [
  { to: "/", label: "Accueil", icon: Home, exact: true },
  { to: "/orientation", label: "Questionnaire", icon: ClipboardList, exact: false },
  { to: "/parcours", label: "Parcours", icon: RouteIcon, exact: false },
  { to: "/annuaire", label: "Annuaire", icon: MapPin, exact: false },
  { to: "/conseils", label: "Conseils", icon: PlayCircle, exact: false },
];

/** Barre de navigation basse : accès en un geste aux 5 écrans clés sur mobile. */
export function MobileTabBar() {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 overflow-hidden rounded-2xl border border-border/80 bg-background/90 shadow-[0_12px_40px_-22px_var(--foreground)] backdrop-blur-xl sm:hidden print:hidden">
      <ul className="grid grid-cols-5">
        {items.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              activeOptions={{ exact: item.exact }}
              activeProps={{ className: "text-care" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="flex flex-col items-center gap-1 px-1 py-2 text-[11px] font-medium"
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
