import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width="22"
        height="22"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="lg-grad" x1="0" y1="0" x2="32" y2="32">
            <stop offset="0%" stopColor="hsl(142, 76%, 70%)" />
            <stop offset="100%" stopColor="hsl(160, 64%, 45%)" />
          </linearGradient>
        </defs>
        <path
          d="M6 4 L26 4 L26 14 L18 14 L18 28 L6 28 Z"
          fill="url(#lg-grad)"
        />
        <path
          d="M22 18 L26 18 L26 28 L22 28 Z"
          fill="url(#lg-grad)"
          opacity="0.6"
        />
      </svg>
      {showWordmark && (
        <span className="text-base font-semibold tracking-tight">
          Skillforge
        </span>
      )}
    </div>
  );
}
