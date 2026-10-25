import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Clock, Film, Upload } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Card, Badge, btnClass } from "@/components/ui-kit";
import { useReview } from "@/lib/review-store";
import { counts } from "@/lib/review-logic";
import { TEAM } from "@/lib/demo-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Coach Dashboard · SidelineReel" },
      { name: "description", content: "Overview of highlight processing and player match reviews for Ridgeline U14 Soccer." },
      { property: "og:title", content: "Coach Dashboard · SidelineReel" },
      { property: "og:description", content: "Overview of highlight processing and player match reviews." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { clips, activity } = useReview();
  const c = counts(clips);
  return (
    <>
      <PageHeader
        title="Welcome back, Coach Reyes"
        subtitle={<>{TEAM.name} · Latest game {TEAM.game}, {TEAM.gameDate}</>}
      />

      <Card className="mb-6 flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {c.pending > 0 ? `${c.pending} highlight${c.pending > 1 ? "s" : ""} need player verification` : "All highlights verified"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {c.pending > 0
              ? "Unverified clips are held back from player reels and the weekly recap until you review them."
              : "Every clip has a confirmed player and is eligible for the weekly recap."}
          </p>
        </div>
        <Link to="/queue" className={btnClass("primary")}>
          Review Player Matches <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat icon={<Film className="h-5 w-5 text-primary" />} label="Clips processed" value={c.total} />
        <Stat icon={<Clock className="h-5 w-5 text-warning" />} label="Awaiting review" value={c.pending} />
        <Stat icon={<CheckCircle2 className="h-5 w-5 text-success" />} label="Reviewed" value={c.reviewed} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 font-semibold">Recent game uploads</h2>
          <ul className="divide-y">
            {[
              { g: `${TEAM.game}`, d: TEAM.gameDate, n: `${c.total} clips`, s: c.pending ? "In review" : "Ready" },
              { g: "vs. Northside United", d: "Sat, Oct 17", n: "Published recap", s: "Published" },
            ].map((u) => (
              <li key={u.g} className="flex items-center gap-3 py-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{u.g}</p>
                  <p className="text-xs text-muted-foreground">{u.d} · {u.n}</p>
                </div>
                <Badge tone={u.s === "In review" ? "warning" : "success"}>{u.s}</Badge>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 font-semibold">Recent activity</h2>
          <ul className="space-y-3">
            {activity.slice(0, 6).map((a) => (
              <li key={a.id} className="flex gap-3 text-sm">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div>
                  <p>{a.text}</p>
                  <p className="text-xs text-muted-foreground">{a.at}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-3xl font-bold tabular-nums">{value}</p>
    </Card>
  );
}
