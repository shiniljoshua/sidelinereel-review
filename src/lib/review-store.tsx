import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { INITIAL_CLIPS, type Clip } from "./demo-data";
import { applyReview } from "./review-logic";

const KEY = "sidelinereel-demo-v1";

type Activity = { id: string; text: string; at: string };

type Store = {
  clips: Clip[];
  activity: Activity[];
  simulateFailure: boolean;
  setSimulateFailure: (v: boolean) => void;
  saveReview: (clipId: string, playerId: string, reason: string | null) => Promise<void>;
  resetDemo: () => void;
};

const Ctx = createContext<Store | null>(null);

const INITIAL_ACTIVITY: Activity[] = [
  { id: "a1", text: "3 highlight clips generated from vs. Lakeview FC", at: "Today, 9:14 AM" },
  { id: "a2", text: "2 clips flagged for player verification", at: "Today, 9:14 AM" },
  { id: "a3", text: "Game footage uploaded by Coach Jordan Reyes", at: "Today, 8:52 AM" },
];

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [clips, setClips] = useState<Clip[]>(INITIAL_CLIPS);
  const [activity, setActivity] = useState<Activity[]>(INITIAL_ACTIVITY);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { clips: Clip[]; activity: Activity[] };
        // Merge saved review state onto fresh base data (keeps image URLs current)
        setClips(INITIAL_CLIPS.map((c) => ({ ...c, ...pickReview(saved.clips.find((s) => s.id === c.id)) })));
        setActivity(saved.activity ?? INITIAL_ACTIVITY);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify({ clips, activity }));
  }, [clips, activity, loaded]);

  const saveReview = useCallback(
    async (clipId: string, playerId: string, reason: string | null) => {
      await new Promise((r) => setTimeout(r, 700));
      if (simulateFailure) throw new Error("Couldn't save the assignment (simulated network error). Your selection was kept — try again.");
      let next: Clip[] = [];
      setClips((prev) => (next = applyReview(prev, clipId, playerId, reason)));
      const clip = next.find((c) => c.id === clipId);
      if (clip) {
        const verb = clip.resolution === "corrected" ? "Corrected" : "Confirmed";
        setActivity((a) => [
          { id: crypto.randomUUID(), text: `${verb} player for “${clip.title}”`, at: "Just now" },
          ...a,
        ]);
      }
    },
    [simulateFailure],
  );

  const resetDemo = useCallback(() => {
    setClips(INITIAL_CLIPS);
    setActivity(INITIAL_ACTIVITY);
    setSimulateFailure(false);
  }, []);

  const value = useMemo(
    () => ({ clips, activity, simulateFailure, setSimulateFailure, saveReview, resetDemo }),
    [clips, activity, simulateFailure, saveReview, resetDemo],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function pickReview(c: Clip | undefined): Partial<Clip> {
  if (!c) return {};
  const { status, finalPlayerId, resolution, correctionReason, reviewedAt } = c;
  return { status, finalPlayerId, resolution, correctionReason, reviewedAt };
}

export function useReview() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useReview must be used inside ReviewProvider");
  return v;
}
