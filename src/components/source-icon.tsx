import type { SourceType } from "@/lib/types";
import { cn } from "@/lib/utils";

const COLORS: Record<SourceType, string> = {
  slack: "bg-[#4A154B] text-white",
  notion: "bg-zinc-100 text-black dark:bg-zinc-200 dark:text-black",
  drive: "bg-[#1A73E8] text-white",
  github: "bg-zinc-900 text-white border border-zinc-700",
  intercom: "bg-[#1F8DED] text-white",
  linear: "bg-[#5E6AD2] text-white",
  email: "bg-amber-500 text-black",
};

const LABELS: Record<SourceType, string> = {
  slack: "S",
  notion: "N",
  drive: "G",
  github: "GH",
  intercom: "I",
  linear: "L",
  email: "@",
};

export function SourceIcon({
  type,
  size = 20,
  className,
}: {
  type: SourceType;
  size?: number;
  className?: string;
}) {
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.5 }}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-semibold",
        COLORS[type],
        className
      )}
    >
      {LABELS[type]}
    </div>
  );
}

export function sourceLabel(type: SourceType): string {
  return {
    slack: "Slack",
    notion: "Notion",
    drive: "Google Drive",
    github: "GitHub",
    intercom: "Intercom",
    linear: "Linear",
    email: "Email",
  }[type];
}
