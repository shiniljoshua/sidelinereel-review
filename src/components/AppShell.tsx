import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LayoutDashboard, ListChecks, Users, RotateCcw, Film } from "lucide-react";
import { useReview } from "@/lib/review-store";
import { counts } from "@/lib/review-logic";
import { TEAM } from "@/lib/demo-data";

const linkCls =
  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-navy-muted transition-colors hover:bg-navy-foreground/10 hover:text-navy-foreground";
const activeCls = "!bg-navy-foreground/15 !text-navy-foreground";

export function AppShell({ children }: { children: ReactNode }) {
  const { clips, resetDemo } = useReview();
  const { pending } = counts(clips);
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-navy p-4 text-navy-foreground md:flex">
        <Link to="/" className="mb-8 flex items-center gap-2.5 px-2 pt-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary">
            <Film className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="text-lg font-bold tracking-tight">SidelineReel</span>
        </Link>
        <nav className="flex flex-col gap-1" aria-label="Main">
          <Link to="/" className={linkCls} activeProps={{ className: activeCls }} activeOptions={{ exact: true }}>
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <Link to="/queue" className={linkCls} activeProps={{ className: activeCls }}>
            <ListChecks className="h-4 w-4" /> Review Queue
            {pending > 0 && (
              <span className="ml-auto rounded-full bg-warning px-2 py-0.5 text-xs font-bold text-primary-foreground" aria-label={`${pending} pending`}>
                {pending}
              </span>
            )}
          </Link>
          <Link to="/roster" className={linkCls} activeProps={{ className: activeCls }}>
            <Users className="h-4 w-4" /> Team Roster
          </Link>
        </nav>
        <div className="mt-auto space-y-3">
          <button
            onClick={() => {
              if (confirm("Reset all demo clips and assignments to the original sample data?")) resetDemo();
            }}
            className={linkCls + " w-full"}
          >
            <RotateCcw className="h-4 w-4" /> Reset Demo Data
          </button>
          <div className="flex items-center gap-3 rounded-lg bg-navy-foreground/10 p-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">JR</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{TEAM.coach}</p>
              <p className="truncate text-xs text-navy-muted">{TEAM.name}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile/tablet top nav */}
        <header className="flex items-center gap-1 overflow-x-auto bg-navy px-3 py-2 text-navy-foreground md:hidden">
          <span className="mr-2 font-bold">SidelineReel</span>
          <Link to="/" className={linkCls} activeProps={{ className: activeCls }} activeOptions={{ exact: true }}>Dashboard</Link>
          <Link to="/queue" className={linkCls} activeProps={{ className: activeCls }}>Queue ({pending})</Link>
          <Link to="/roster" className={linkCls} activeProps={{ className: activeCls }}>Roster</Link>
          <button onClick={() => confirm("Reset demo data?") && resetDemo()} className={linkCls}>Reset</button>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 md:px-10">{children}</main>
        <footer className="border-t px-5 py-4 text-center text-xs text-muted-foreground md:px-10">
          SidelineReel prototype. Demonstration data for the Ajaia LLC Product Manager assessment. ·{" "}
          <a href="https://ajaia.ai" target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
            ajaia.ai
          </a>
        </footer>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
