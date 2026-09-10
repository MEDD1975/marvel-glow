import { Link, useLocation } from "@tanstack/react-router";
import { Home, ClipboardList, MapPin } from "lucide-react";

const patientItems = [
  { to: "/", label: "Accueil", icon: Home, exact: true },
  { to: "/annuaire", label: "Annuaire", icon: MapPin, exact: false },
];

const doctorItems = [{ to: "/cabinet", label: "Gestion médecin", icon: ClipboardList, exact: true }];

/** Barre de navigation basse : accès en un geste aux 4 écrans clés sur mobile. */
export function MobileTabBar() {
  const location = useLocation();
  const items = location.pathname.startsWith("/cabinet") ? doctorItems : patientItems;

  return (
    <nav className="mt-10 overflow-hidden rounded-2xl border border-border/80 bg-background pb-[env(safe-area-inset-bottom)] sm:hidden print:hidden">
      <ul className={items.length === 1 ? "grid grid-cols-1" : "grid grid-cols-2"}>
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
