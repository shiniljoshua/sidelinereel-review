import { ROSTER, type Clip } from "./demo-data";

export function isPending(c: Clip) {
  return c.status !== "reviewed";
}

export function isPublishEligible(c: Clip) {
  return c.status === "reviewed" && !!c.finalPlayerId;
}

export function counts(clips: Clip[]) {
  const pending = clips.filter(isPending).length;
  return { total: clips.length, pending, reviewed: clips.length - pending };
}

export function confidenceLabel(conf: number): { label: string; tone: "danger" | "warning" | "success" } {
  if (conf < 50) return { label: "Low confidence", tone: "danger" };
  if (conf < 80) return { label: "Medium confidence", tone: "warning" };
  return { label: "High confidence", tone: "success" };
}

/** Pure: returns new clip list with exactly one clip resolved. Throws on invalid input. */
export function applyReview(
  clips: Clip[],
  clipId: string,
  playerId: string,
  correctionReason: string | null,
  now: string = new Date().toISOString(),
): Clip[] {
  const clip = clips.find((c) => c.id === clipId);
  if (!clip) throw new Error("Clip not found");
  if (!ROSTER.some((p) => p.id === playerId)) throw new Error("Select a valid roster player");
  const resolution = playerId === clip.suggestedPlayerId ? "confirmed" : "corrected";
  return clips.map((c) =>
    c.id === clipId
      ? {
          ...c,
          status: "reviewed",
          finalPlayerId: playerId,
          resolution,
          correctionReason: resolution === "corrected" ? correctionReason?.trim() || null : null,
          reviewedAt: now,
        }
      : c,
  );
}
