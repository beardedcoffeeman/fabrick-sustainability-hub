import { auth, signOut } from "@/auth";
import { CalendarPanel } from "@/components/director/CalendarPanel";
import { TasksPanel } from "@/components/director/TasksPanel";
import { GeorgiaPanel } from "@/components/director/GeorgiaPanel";

export const dynamic = "force-dynamic";

export default async function DirectorHomePage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Director&apos;s Brief
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Signed in as {session?.user?.email ?? "—"} ·{" "}
            <span className="text-stone-400">
              {new Date().toLocaleString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </p>
          <p className="mt-1 text-xs text-stone-400">
            Live data — panels auto-refresh every 2 min.
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/director/login" });
          }}
        >
          <button
            type="submit"
            className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100"
          >
            Sign out
          </button>
        </form>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <CalendarPanel />
          <TasksPanel />
        </div>
        <div className="space-y-6">
          <GeorgiaPanel />
        </div>
      </div>

      <footer className="mt-12 text-xs text-stone-400">
        Phase 1 — read-only live dashboard. Tickable tasks land in Phase 2; FlowSavvy time blocks in Phase 4.
      </footer>
    </div>
  );
}
