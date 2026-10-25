import goalImg from "@/assets/clip-goal.jpg";
import saveImg from "@/assets/clip-save.jpg";
import midfieldImg from "@/assets/clip-midfield.jpg";

export type Player = { id: string; name: string; number: number; position: string };

export type ClipStatus = "needs_review" | "awaiting_confirmation" | "reviewed";

export type Clip = {
  id: string;
  title: string;
  game: string;
  timestamp: string;
  duration: string;
  thumbnail: string;
  detectedNumber: number;
  numberReadability: "clear" | "ambiguous" | "obscured";
  suggestedPlayerId: string;
  confidence: number;
  reason: string | null;
  status: ClipStatus;
  finalPlayerId: string | null;
  resolution: "confirmed" | "corrected" | null;
  correctionReason: string | null;
  reviewedAt: string | null;
};

export const TEAM = {
  name: "Ridgeline U14 Soccer",
  coach: "Coach Jordan Reyes",
  game: "vs. Lakeview FC",
  gameDate: "Sat, Oct 24",
};

export const ROSTER: Player[] = [
  { id: "olivia-kim", name: "Olivia Kim", number: 4, position: "Defender" },
  { id: "emma-carter", name: "Emma Carter", number: 14, position: "Forward" },
  { id: "ethan-miller", name: "Ethan Miller", number: 1, position: "Goalkeeper" },
  { id: "noah-brown", name: "Noah Brown", number: 11, position: "Goalkeeper" },
  { id: "liam-garcia", name: "Liam Garcia", number: 7, position: "Midfielder" },
  { id: "ava-johnson", name: "Ava Johnson", number: 21, position: "Midfielder" },
];

export const INITIAL_CLIPS: Clip[] = [
  {
    id: "goal-celebration",
    title: "Goal Celebration",
    game: `${TEAM.game} · ${TEAM.gameDate}`,
    timestamp: "2nd half · 34:12",
    duration: "0:18",
    thumbnail: goalImg,
    detectedNumber: 14,
    numberReadability: "ambiguous",
    suggestedPlayerId: "olivia-kim",
    confidence: 42,
    reason: "Similar jersey numbers detected. Number 14 may have been confused with number 4.",
    status: "needs_review",
    finalPlayerId: null,
    resolution: null,
    correctionReason: null,
    reviewedAt: null,
  },
  {
    id: "goalkeeper-save",
    title: "Goalkeeper Save",
    game: `${TEAM.game} · ${TEAM.gameDate}`,
    timestamp: "1st half · 12:47",
    duration: "0:11",
    thumbnail: saveImg,
    detectedNumber: 11,
    numberReadability: "clear",
    suggestedPlayerId: "noah-brown",
    confidence: 91,
    reason: null,
    status: "awaiting_confirmation",
    finalPlayerId: null,
    resolution: null,
    correctionReason: null,
    reviewedAt: null,
  },
  {
    id: "midfield-breakthrough",
    title: "Midfield Breakthrough",
    game: `${TEAM.game} · ${TEAM.gameDate}`,
    timestamp: "2nd half · 21:05",
    duration: "0:15",
    thumbnail: midfieldImg,
    detectedNumber: 7,
    numberReadability: "obscured",
    suggestedPlayerId: "liam-garcia",
    confidence: 38,
    reason: "Jersey number is partially obscured.",
    status: "needs_review",
    finalPlayerId: null,
    resolution: null,
    correctionReason: null,
    reviewedAt: null,
  },
];

export function getPlayer(id: string | null | undefined): Player | undefined {
  return ROSTER.find((p) => p.id === id);
}

export function formatPlayer(p: Player | undefined) {
  return p ? `${p.name} (#${p.number})` : "Unassigned";
}
