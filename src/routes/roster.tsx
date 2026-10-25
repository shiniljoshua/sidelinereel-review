import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Avatar, Card, btnClass } from "@/components/ui-kit";
import { ROSTER, TEAM } from "@/lib/demo-data";
import { useReview } from "@/lib/review-store";

export const Route = createFileRoute("/roster")({
  head: () => ({
    meta: [
      { title: "Team Roster · SidelineReel" },
      { name: "description", content: "Ridgeline U14 Soccer roster with jersey numbers." },
      { property: "og:title", content: "Team Roster · SidelineReel" },
      { property: "og:description", content: "Ridgeline U14 Soccer roster with jersey numbers." },
    ],
  }),
  component: Roster,
});

function Roster() {
  const { clips } = useReview();
  return (
    <>
      <PageHeader
        title="Team Roster"
        subtitle={`${TEAM.name} · ${ROSTER.length} players · fictional demo players`}
        action={<Link to="/queue" className={btnClass("secondary")}>Back to Review Queue <ArrowRight className="h-4 w-4" /></Link>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...ROSTER].sort((a, b) => a.number - b.number).map((p) => {
          const verified = clips.filter((c) => c.status === "reviewed" && c.finalPlayerId === p.id).length;
          return (
            <Card key={p.id} className="flex items-center gap-4 p-5">
              <Avatar player={p} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-muted-foreground">#{p.number} · {p.position}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold tabular-nums">{verified}</p>
                <p className="text-xs text-muted-foreground">verified clips</p>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
