import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export function Logo({ className, size = "md", showTagline = false }: LogoProps) {
  const scale = {
    sm: 0.75,
    md: 1,
    lg: 1.35,
  }[size];

  const h = Math.round(40 * scale);

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      {/* Badge K */}
      <svg
        width={h}
        height={h}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0 text-current"
      >
        <rect
          x="2"
          y="2"
          width="36"
          height="36"
          rx="8"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M12 10 V30"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M14 19 L26 10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 21 L26 30"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Petit plus médical en haut à droite */}
        <path
          d="M30 6 V10 M28 8 H32"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* Wordmark + tagline */}
      <div className="flex flex-col leading-none">
        <span className="font-display text-[1.5rem] font-bold tracking-tight text-foreground">
          Kivoir
        </span>
        {showTagline && (
          <span className="mt-0.5 text-[0.65rem] tracking-wide text-muted-foreground">
            Qui voir, quand
          </span>
        )}
      </div>
    </div>
  );
}
