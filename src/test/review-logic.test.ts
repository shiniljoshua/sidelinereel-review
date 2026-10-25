import { describe, expect, it } from "vitest";
import { INITIAL_CLIPS } from "@/lib/demo-data";
import { applyReview, counts, isPublishEligible } from "@/lib/review-logic";

describe("roster match review", () => {
  it("correcting Goal Celebration assigns Emma Carter and marks it corrected", () => {
    const next = applyReview(INITIAL_CLIPS, "goal-celebration", "emma-carter", "Jersey shows 14");
    const c = next.find((x) => x.id === "goal-celebration")!;
    expect(c.finalPlayerId).toBe("emma-carter");
    expect(c.resolution).toBe("corrected");
    expect(c.status).toBe("reviewed");
  });

  it("confirming the suggestion saves the suggested player", () => {
    const c = applyReview(INITIAL_CLIPS, "goalkeeper-save", "noah-brown", null).find((x) => x.id === "goalkeeper-save")!;
    expect(c.finalPlayerId).toBe("noah-brown");
    expect(c.resolution).toBe("confirmed");
  });

  it("pending count drops by one and other clips stay unresolved", () => {
    expect(counts(INITIAL_CLIPS).pending).toBe(3);
    const next = applyReview(INITIAL_CLIPS, "goal-celebration", "emma-carter", null);
    expect(counts(next).pending).toBe(2);
    expect(next.find((x) => x.id === "midfield-breakthrough")!.status).toBe("needs_review");
  });

  it("unresolved clips are not publish-eligible; resolved ones are", () => {
    expect(INITIAL_CLIPS.some(isPublishEligible)).toBe(false);
    const next = applyReview(INITIAL_CLIPS, "goal-celebration", "emma-carter", null);
    expect(isPublishEligible(next.find((x) => x.id === "goal-celebration")!)).toBe(true);
  });

  it("rejects an invalid player", () => {
    expect(() => applyReview(INITIAL_CLIPS, "goal-celebration", "", null)).toThrow();
  });
});
