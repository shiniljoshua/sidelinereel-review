import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, CheckCircle2, ImageOff } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Card, Confidence, StatusBadge, JerseyNum, btnClass } from "@/components/ui-kit";
import { useReview } from "@/lib/review-store";
import { counts, isPending } from "@/lib/review-logic";
import { formatPlayer, getPlayer } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/queue")({
  head: () => ({
    meta: [
      { title: "Player Match Review · SidelineReel" },
      { name: "description", content: "Verify or correct highlight clips with uncertain player matches." },
      { property: "og:title", content: "Player Match Review · SidelineReel" },
      { property: "og:description", content: "Verify or correct highlight clips with uncertain player matches." },
    ],
  }),
  component: Queue,
});

type Filter = "all" | "pending" | "reviewed";

function Queue() {
  const { clips } = useReview();
  const c = counts(clips);
  const [filter, setFilter] = useState<Filter>("all");
  const shown = clips.filter((x) => (filter === "all" ? true : filter === "pending" ? isPending(x) : !isPending(x)));

  return (
    <>
      <PageHeader title="Player Match Review" subtitle="Verify which player appears in each highlight before it's published." />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-3">
          <span className="rounded-lg border bg-warning-soft px-3 py-1.5 text-sm font-semibold text-warning">{c.pending} pending</span>
          <span className="rounded-lg border bg-success-soft px-3 py-1.5 text-sm font-semibold text-success">{c.reviewed} reviewed</span>
        </div>
        <div className="ml-auto inline-flex rounded-lg border bg-card p-1" role="tablist" aria-label="Filter by status">
          {(["all", "pending", "reviewed"] as Filter[]).map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium capitalize",
                filter === f ? "bg-navy text-navy-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {c.pending === 0 && filter !== "reviewed" && (
        <Card className="mb-6 flex flex-col items-center p-10 text-center">
          <CheckCircle2 className="h-10 w-10 text-success" />
          <h2 className="mt-3 text-lg font-semibold">All caught up</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            No clips are waiting for review. Every highlight has a verified player and is eligible for the weekly recap (simulated).
          </p>
          <Link to="/" className={btnClass("secondary", "mt-5")}>Back to dashboard</Link>
        </Card>
      )}

      <div className="space-y-4">
        {shown.length === 0 && filter === "reviewed" && (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No reviewed clips yet.</p>
        )}
        {shown.map((clip) => {
          const suggested = getPlayer(clip.suggestedPlayerId)!;
          const final = getPlayer(clip.finalPlayerId);
          const reviewed = clip.status === "reviewed";
          const mismatch = suggested.number !== clip.detectedNumber;
          return (
            <Card key={clip.id} className={cn("overflow-hidden", reviewed && "bg-secondary/40")}>
              <Link
                to="/review/$clipId"
                params={{ clipId: clip.id }}
                className="grid gap-5 p-4 transition-colors hover:bg-secondary/50 sm:grid-cols-[200px_1fr_auto] sm:items-center"
              >
                <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                  {clip.thumbnail ? (
                    <img src={clip.thumbnail} alt={`Still frame: ${clip.title}`} width={1280} height={720} loading="lazy" className={cn("h-full w-full object-cover", reviewed && "opacity-70")} />
                  ) : (
                    <ImageOff className="m-auto h-6 w-6 text-muted-foreground" />
                  )}
                  <span className="absolute bottom-1.5 right-1.5 rounded bg-navy/80 px-1.5 text-[11px] font-semibold text-navy-foreground">{clip.duration}</span>
                </div>

                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{clip.title}</h3>
                    <StatusBadge clip={clip} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Detected</span>
                      <JerseyNum n={clip.detectedNumber} />
                    </div>
                    {reviewed ? (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Assigned to</span>
                        <span className="font-semibold text-success">{formatPlayer(final)}</span>
                        <span className="text-xs text-muted-foreground">({clip.resolution})</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Suggested</span>
                        <span className={cn("font-semibold", mismatch && "text-danger")}>
                          {suggested.name}, #{suggested.number}
                        </span>
                      </div>
                    )}
                    {!reviewed && <Confidence value={clip.confidence} />}
                  </div>
                  {!reviewed && clip.reason && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Reason:</span>{" "}
                      {clip.id === "goal-celebration" ? "Similar numbers detected. 14 versus 4." : clip.reason}
                    </p>
                  )}
                </div>

                <span className={btnClass(reviewed ? "secondary" : "primary", "whitespace-nowrap")}>
                  {reviewed ? "View review" : "Review Clip"} <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </Card>
          );
        })}
      </div>
    </>
  );
}
