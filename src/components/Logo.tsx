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
  const w = Math.round(h * 3.05);

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <svg
        width={w}
        height={h}
        viewBox="0 0 120 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Kivoir"
        role="img"
        className="text-current"
      >
        {/* Single wordmark for consistent kerning */}
        <text
          x="0"
          y="31"
          fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          fontSize="32"
          fontWeight="600"
          fill="currentColor"
          letterSpacing="-0.02em"
        >
          Kivoir
        </text>
        {/* Custom dot on the i, shifted slightly right to sit above the stem */}
        <circle cx="45" cy="10" r="3" fill="currentColor" opacity="0.95" />
        {/* Subtle baseline orientation line */}
        <line
          x1="2"
          y1="36"
          x2="118"
          y2="36"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.22"
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
