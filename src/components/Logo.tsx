import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export function Logo({ className, size = "md", showTagline = false }: LogoProps) {
  const heights = {
    sm: 28,
    md: 36,
    lg: 48,
  };

  const h = heights[size];
  const w = Math.round(h * 3.1); // ratio largeur/hauteur du wordmark

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <svg
        width={w}
        height={h}
        viewBox="0 0 124 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Kivoir"
        role="img"
      >
        {/* K */}
        <text
          x="0"
          y="31"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          fontSize="32"
          fontWeight="700"
          fill="currentColor"
          letterSpacing="-0.04em"
        >
          K
        </text>
        {/* i dot as orientation marker */}
        <circle cx="42" cy="12" r="3.5" fill="currentColor" />
        <text
          x="34"
          y="31"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          fontSize="32"
          fontWeight="600"
          fill="currentColor"
          letterSpacing="-0.04em"
        >
          i
        </text>
        {/* v */}
        <text
          x="46"
          y="31"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          fontSize="32"
          fontWeight="600"
          fill="currentColor"
          letterSpacing="-0.04em"
        >
          v
        </text>
        {/* oir */}
        <text
          x="69"
          y="31"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          fontSize="32"
          fontWeight="600"
          fill="currentColor"
          letterSpacing="-0.04em"
        >
          oir
        </text>
        {/* subtle orientation line under the baseline */}
        <line
          x1="2"
          y1="36"
          x2="122"
          y2="36"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.25"
        />
      </svg>
      {showTagline && (
        <span className="text-xs tracking-wide text-muted-foreground">
          Qui voir, quand
        </span>
      )}
    </div>
  );
}
