import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Clip, Player } from "@/lib/demo-data";
import { confidenceLabel } from "@/lib/review-logic";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "success";
const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-card text-foreground border border-input hover:bg-secondary",
  ghost: "text-muted-foreground hover:bg-secondary hover:text-foreground",
  success: "bg-success text-primary-foreground hover:bg-success/90",
};

export function Btn({ variant = "primary", className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...p}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
    />
  );
}
export const btnClass = (variant: Variant = "primary", extra = "") =>
  cn(
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
    variants[variant],
    extra,
  );

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-xl border bg-card shadow-card", className)}>{children}</div>;
}

type Tone = "success" | "warning" | "danger" | "info" | "neutral";
const tones: Record<Tone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-primary",
  neutral: "bg-secondary text-muted-foreground",
};
export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ clip }: { clip: Clip }) {
  if (clip.status === "reviewed")
    return (
      <Badge tone="success">
        <CheckCircle2 className="h-3.5 w-3.5" /> Reviewed
      </Badge>
    );
  if (clip.status === "awaiting_confirmation")
    return (
      <Badge tone="info">
        <Clock className="h-3.5 w-3.5" /> Awaiting confirmation
      </Badge>
    );
  return (
    <Badge tone="warning">
      <AlertTriangle className="h-3.5 w-3.5" /> Needs review
    </Badge>
  );
}

export function Confidence({ value }: { value: number }) {
  const { label, tone } = confidenceLabel(value);
  const bar = tone === "danger" ? "bg-danger" : tone === "warning" ? "bg-warning" : "bg-success";
  const text = tone === "danger" ? "text-danger" : tone === "warning" ? "text-warning" : "text-success";
  return (
    <div className="min-w-32">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className={cn("font-semibold", text)}>{label}</span>
        <span className="font-bold tabular-nums text-foreground">{value}%</span>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-secondary" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label="Match confidence">
        <div className={cn("h-full rounded-full", bar)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function Avatar({ player, size = "md" }: { player: Player; size?: "sm" | "md" | "lg" }) {
  const initials = player.name.split(" ").map((s) => s[0]).join("");
  const s = size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-14 w-14 text-base" : "h-10 w-10 text-sm";
  return (
    <div className={cn("relative grid shrink-0 place-items-center rounded-full bg-accent font-bold text-accent-foreground", s)} aria-hidden>
      {initials}
      <span className="absolute -bottom-1 -right-1 rounded-md bg-navy px-1 text-[10px] font-bold leading-4 text-navy-foreground">
        {player.number}
      </span>
    </div>
  );
}

export function JerseyNum({ n, tone = "neutral" }: { n: number; tone?: "neutral" | "danger" | "success" }) {
  return (
    <span
      className={cn(
        "inline-grid h-9 min-w-9 place-items-center rounded-lg px-2 text-base font-extrabold tabular-nums",
        tone === "danger" ? "bg-danger-soft text-danger" : tone === "success" ? "bg-success-soft text-success" : "bg-navy text-navy-foreground",
      )}
    >
      #{n}
    </span>
  );
}
