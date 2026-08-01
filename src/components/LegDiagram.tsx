/** Schéma simplifié du membre inférieur avec un repère sur la zone douloureuse. */
export function LegDiagram({
  spot,
  label,
  className = "",
}: {
  spot: { x: number; y: number };
  label: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 300"
      role="img"
      aria-label={`Schéma de localisation : ${label}`}
      className={`h-auto w-full ${className}`}
    >
      {/* Bassin / hanche */}
      <path
        d="M28 14 h64 a10 10 0 0 1 10 10 v22 a14 14 0 0 1 -14 14 h-56 a14 14 0 0 1 -14 -14 v-22 a10 10 0 0 1 10 -10 z"
        className="fill-muted stroke-border"
        strokeWidth="2"
      />
      {/* Cuisse */}
      <path
        d="M40 58 h40 l-4 84 h-32 z"
        className="fill-muted stroke-border"
        strokeWidth="2"
      />
      {/* Genou */}
      <circle cx="60" cy="152" r="17" className="fill-muted stroke-border" strokeWidth="2" />
      <circle cx="60" cy="152" r="7" className="fill-none stroke-border" strokeWidth="1.5" />
      {/* Jambe */}
      <path
        d="M47 168 h26 l-3 62 h-20 z"
        className="fill-muted stroke-border"
        strokeWidth="2"
      />
      {/* Cheville */}
      <circle cx="60" cy="238" r="11" className="fill-muted stroke-border" strokeWidth="2" />
      {/* Pied de profil */}
      <path
        d="M50 246 h20 v14 h32 a6 6 0 0 1 6 6 v6 h-58 a6 6 0 0 1 -6 -6 z"
        className="fill-muted stroke-border"
        strokeWidth="2"
      />

      {/* Repère de la zone douloureuse */}
      <circle cx={spot.x} cy={spot.y} r="16" className="fill-urgent/15" />
      <circle cx={spot.x} cy={spot.y} r="9" className="fill-urgent/35" />
      <circle cx={spot.x} cy={spot.y} r="4" className="fill-urgent" />
    </svg>
  );
}
