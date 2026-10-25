import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, CheckCircle2, Info, Loader2, PencilLine, VideoOff, XCircle } from "lucide-react";
import { Avatar, Badge, Btn, Card, Confidence, JerseyNum, StatusBadge, btnClass } from "@/components/ui-kit";
import { PublishPanel } from "@/components/PublishPanel";
import { useReview } from "@/lib/review-store";
import { ROSTER, formatPlayer, getPlayer, type Clip } from "@/lib/demo-data";
import { isPending } from "@/lib/review-logic";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/review/$clipId")({
  head: () => ({
    meta: [
      { title: "Clip Review · SidelineReel" },
      { name: "description", content: "Verify the player assigned to a highlight clip." },
      { property: "og:title", content: "Clip Review · SidelineReel" },
      { property: "og:description", content: "Verify the player assigned to a highlight clip." },
    ],
  }),
  component: ReviewPage,
});

function ReviewPage() {
  const { clipId } = Route.useParams();
  const { clips } = useReview();
  const clip = clips.find((c) => c.id === clipId);
  if (!clip)
    return (
      <Card className="p-10 text-center">
        <h1 className="text-lg font-semibold">Clip not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">This highlight may have been removed.</p>
        <Link to="/queue" className={btnClass("primary", "mt-5")}>Back to Review Queue</Link>
      </Card>
    );
  return <ClipReview key={clip.id} clip={clip} />;
}

const readability = {
  clear: "Clearly visible",
  ambiguous: "Ambiguous — may be misread",
  obscured: "Partially obscured",
};

function ClipReview({ clip }: { clip: Clip }) {
  const { clips, saveReview, simulateFailure, setSimulateFailure } = useReview();
  const navigate = useNavigate();
  const suggested = getPlayer(clip.suggestedPlayerId)!;
  const [mode, setMode] = useState<"edit" | "success" | "summary">(clip.status === "reviewed" ? "summary" : "edit");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState<null | "confirm" | "correct">(null);
  const [error, setError] = useState<string | null>(null);

  const selected = getPlayer(selectedId);
  const isSameAsSuggested = selectedId === suggested.id;
  const canCorrect = !!selected && !isSameAsSuggested && !saving;
  const mismatch = suggested.number !== clip.detectedNumber;
  const nextPending = clips.find((c) => c.id !== clip.id && isPending(c));

  async function submit(kind: "confirm" | "correct") {
    const playerId = kind === "confirm" ? suggested.id : selectedId;
    if (!playerId) return;
    setSaving(kind);
    setError(null);
    try {
      await saveReview(clip.id, playerId, kind === "correct" ? reason : null);
      setMode("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(null);
    }
  }

  const final = getPlayer(clip.finalPlayerId);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link to="/queue" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Review Queue
        </Link>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <input type="checkbox" checked={simulateFailure} onChange={(e) => setSimulateFailure(e.target.checked)} className="accent-[var(--danger)]" />
          Demo: simulate save failure
        </label>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{clip.title}</h1>
        <StatusBadge clip={clip} />
        <span className="text-sm text-muted-foreground">{clip.game} · {clip.timestamp}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        {/* Left: preview + detection */}
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-navy">
              <img src={clip.thumbnail} alt={`Still frame from ${clip.title}`} width={1280} height={720} className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-navy/85 px-4 py-2.5 text-xs text-navy-foreground">
                <VideoOff className="h-4 w-4" />
                Still frame only · Video playback isn't available in this prototype
                <span className="ml-auto font-semibold">{clip.duration}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Detection result</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Detected jersey number</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <JerseyNum n={clip.detectedNumber} />
                  <span className="text-xs text-muted-foreground">{readability[clip.numberReadability]}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Suggested player</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <JerseyNum n={suggested.number} tone={mismatch ? "danger" : "neutral"} />
                  <span className="font-semibold">{suggested.name}</span>
                </div>
              </div>
              <div className="sm:col-span-2">
                <Confidence value={clip.confidence} />
                <p className="mt-1 text-[11px] text-muted-foreground">Illustrative demo value, not measured model performance.</p>
              </div>
            </div>
            {mismatch && (
              <div className="mt-5 flex gap-2.5 rounded-lg border border-danger/25 bg-danger-soft p-3 text-sm">
                <AlertTriangle className="h-4 w-4 shrink-0 translate-y-0.5 text-danger" />
                <p>
                  <span className="font-semibold">Number mismatch:</span> detected <b>#{clip.detectedNumber}</b>, but the suggested player wears <b>#{suggested.number}</b>.
                </p>
              </div>
            )}
            {clip.reason && (
              <div className="mt-3 flex gap-2.5 rounded-lg bg-secondary p-3 text-sm">
                <Info className="h-4 w-4 shrink-0 translate-y-0.5 text-muted-foreground" />
                <p><span className="font-semibold">Why flagged:</span> {clip.reason}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right: action panel */}
        <div className="space-y-4">
          {mode === "success" && final && (
            <Card className="p-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-success" />
                <h2 className="text-lg font-bold">{clip.resolution === "corrected" ? "Player assignment updated." : "Suggested player confirmed."}</h2>
              </div>
              <p className="mt-2 text-sm">
                {clip.title} is now assigned to <b>{formatPlayer(final)}</b>.
              </p>
              <Summary clip={clip} />
              <div className="mt-5 flex flex-wrap gap-2">
                <Link to="/queue" className={btnClass("secondary")}><ArrowLeft className="h-4 w-4" /> Back to Review Queue</Link>
                {nextPending ? (
                  <Link to="/review/$clipId" params={{ clipId: nextPending.id }} className={btnClass("primary")}>
                    Review next clip <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <span className="self-center text-sm text-success">No more pending clips 🎉</span>
                )}
              </div>
            </Card>
          )}

          {mode === "summary" && final && (
            <Card className="p-6">
              <div className="flex items-center gap-2">
                <Badge tone="success"><CheckCircle2 className="h-3.5 w-3.5" /> Reviewed</Badge>
                <span className="text-sm text-muted-foreground">This clip was already reviewed.</span>
              </div>
              <Summary clip={clip} />
              <div className="mt-5 flex flex-wrap gap-2">
                <Link to="/queue" className={btnClass("secondary")}>Back to Review Queue</Link>
                <Btn variant="ghost" onClick={() => { setMode("edit"); setSelectedId(null); }}>
                  <PencilLine className="h-4 w-4" /> Change assignment
                </Btn>
              </div>
            </Card>
          )}

          {mode === "edit" && (
            <Card className="p-5">
              <h2 className="font-semibold">Who is in this clip?</h2>
              <p className="mt-1 text-sm text-muted-foreground">Confirm the suggestion, or pick the correct player from the roster.</p>

              <fieldset className="mt-4">
                <legend className="sr-only">Select player from roster</legend>
                <div className="grid gap-2">
                  {ROSTER.map((p) => {
                    const checked = selectedId === p.id;
                    const isSug = p.id === suggested.id;
                    const matchesDetected = p.number === clip.detectedNumber;
                    return (
                      <label
                        key={p.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 transition-colors",
                          checked ? "border-primary bg-info-soft ring-1 ring-primary" : "hover:bg-secondary",
                        )}
                      >
                        <input type="radio" name="player" value={p.id} checked={checked} onChange={() => { setSelectedId(p.id); setError(null); }} className="sr-only" />
                        <Avatar player={p} size="sm" />
                        <span className="flex-1 text-sm font-medium">#{p.number} · {p.name}</span>
                        {isSug && <Badge tone="neutral">Suggested</Badge>}
                        {matchesDetected && <Badge tone="info">Matches #{clip.detectedNumber}</Badge>}
                        {checked && <Check className="h-4 w-4 text-primary" />}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className="mt-4 rounded-lg bg-secondary p-3 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Final assignment (not saved yet)</p>
                {selected && !isSameAsSuggested ? (
                  <p className="mt-1">
                    <span className="text-muted-foreground line-through">{formatPlayer(suggested)}</span>{" "}
                    <ArrowRight className="inline h-3.5 w-3.5" /> <b>{formatPlayer(selected)}</b>
                  </p>
                ) : (
                  <p className="mt-1"><b>{formatPlayer(suggested)}</b> <span className="text-muted-foreground">(suggested)</span></p>
                )}
                {isSameAsSuggested && <p className="mt-1 text-xs text-muted-foreground">That's the suggested player — use “Confirm Suggested Player” below.</p>}
              </div>

              {selected && !isSameAsSuggested && (
                <div className="mt-4">
                  <label htmlFor="reason" className="text-sm font-medium">Correction reason <span className="font-normal text-muted-foreground">(optional)</span></label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    placeholder="e.g. Jersey clearly shows 14 in the replay"
                    className="mt-1.5 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )}

              {error && (
                <div role="alert" className="mt-4 flex gap-2 rounded-lg border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
                  <XCircle className="h-4 w-4 shrink-0 translate-y-0.5" /> {error}
                </div>
              )}

              <div className="mt-5 grid gap-2">
                <Btn onClick={() => submit("correct")} disabled={!canCorrect} title={!selected ? "Select a different player from the roster first" : undefined}>
                  {saving === "correct" ? <Loader2 className="h-4 w-4 animate-spin" /> : <PencilLine className="h-4 w-4" />}
                  {selected && !isSameAsSuggested ? `Save Corrected Assignment (${selected.name}, #${selected.number})` : "Save Corrected Assignment"}
                </Btn>
                <Btn variant="secondary" onClick={() => submit("confirm")} disabled={!!saving || (!!selected && !isSameAsSuggested)}>
                  {saving === "confirm" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Confirm Suggested Player ({suggested.name}, #{suggested.number})
                </Btn>
                <Btn variant="ghost" disabled={!!saving} onClick={() => navigate({ to: "/queue" })}>
                  Cancel — keep original assignment
                </Btn>
              </div>
              {!selected && <p className="mt-2 text-center text-xs text-muted-foreground">Select a different player to enable correction.</p>}
            </Card>
          )}

          <PublishPanel clip={clip} />
        </div>
      </div>
    </>
  );
}

function Summary({ clip }: { clip: Clip }) {
  const final = getPlayer(clip.finalPlayerId);
  const suggested = getPlayer(clip.suggestedPlayerId);
  return (
    <dl className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-secondary p-4 text-sm">
      <div><dt className="text-xs text-muted-foreground">Status</dt><dd className="mt-0.5"><Badge tone="success">Reviewed</Badge></dd></div>
      <div><dt className="text-xs text-muted-foreground">Detected number</dt><dd className="mt-0.5 font-semibold">#{clip.detectedNumber}</dd></div>
      <div><dt className="text-xs text-muted-foreground">Original suggestion</dt><dd className="mt-0.5">{formatPlayer(suggested)}</dd></div>
      <div><dt className="text-xs text-muted-foreground">Final assignment</dt><dd className="mt-0.5 font-semibold text-success">{formatPlayer(final)}</dd></div>
      {clip.correctionReason && (
        <div className="col-span-2"><dt className="text-xs text-muted-foreground">Correction reason</dt><dd className="mt-0.5">{clip.correctionReason}</dd></div>
      )}
    </dl>
  );
}
