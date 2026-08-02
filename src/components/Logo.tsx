import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export function Logo({ className, size = "md", showTagline = false }: LogoProps) {
  const heights = {
    sm: 26,
    md: 34,
    lg: 46,
  };

  const h = heights[size];
  const w = Math.round(h * 3.15);

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <svg
        width={w}
        height={h}
        viewBox="0 0 130 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Kivoir"
        role="img"
        className="text-current"
      >
        <text
          x="0"
          y="31"
          fontFamily="'Space Grotesk', ui-sans-serif, system-ui, sans-serif"
          fontSize="34"
          fontWeight="700"
          fill="currentColor"
          letterSpacing="-0.03em"
        >
          Kivoir
        </text>
        <line
          x1="2"
          y1="37"
          x2="128"
          y2="37"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.2"
        />
      </svg>
      {showTagline && (
        <span className="font-sans text-xs tracking-wide text-muted-foreground">
          Qui voir, quand
        </span>
      )}
    </div>
  );
}
