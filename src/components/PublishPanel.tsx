import { ShieldAlert, ShieldCheck } from "lucide-react";
import { formatPlayer, getPlayer, type Clip } from "@/lib/demo-data";
import { isPublishEligible } from "@/lib/review-logic";
import { cn } from "@/lib/utils";

export function PublishPanel({ clip, compact = false }: { clip: Clip; compact?: boolean }) {
  const ok = isPublishEligible(clip);
  return (
    <div
      role="status"
      className={cn(
        "flex gap-3 rounded-xl border p-4",
        ok ? "border-success/30 bg-success-soft" : "border-warning/30 bg-warning-soft",
        compact && "p-3",
      )}
    >
      {ok ? <ShieldCheck className="h-5 w-5 shrink-0 text-success" /> : <ShieldAlert className="h-5 w-5 shrink-0 text-warning" />}
      <div className="text-sm">
        <p className="font-semibold text-foreground">
          {ok ? "Eligible for publishing" : "Excluded from publishing"}{" "}
          <span className="ml-1 rounded bg-card px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Simulated</span>
        </p>
        <p className="mt-1 text-muted-foreground">
          {ok
            ? `Verified for ${formatPlayer(getPlayer(clip.finalPlayerId))}. Will be included in their player reel and the weekly team recap.`
            : "Pending coach review. This clip will not be included in the published player reel or weekly team recap until the player assignment is confirmed."}
        </p>
      </div>
    </div>
  );
}
