"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  LayoutDashboard,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { saveAccount, updateLocalUser, useAccount } from "@/lib/useAccount";
import {
  WIDGET_CATALOGUE,
  type WidgetInstance,
  type WidgetType,
} from "@/lib/widgets";
import { WidgetHost } from "./WidgetHost";
import { track } from "@/lib/analytics";

// ---------------------------------------------------------------------------
// The signed-in personal dashboard: the user's chosen live-data widgets, in
// their order, with add/remove/reorder/config controls. Every change saves to
// the account (optimistic local update first), so the same board greets them
// on any device, every login.
// ---------------------------------------------------------------------------

function SignedOutPitch() {
  return (
    <div className="mx-auto max-w-3xl text-center py-16">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
        <LayoutDashboard className="h-6 w-6 text-teal" />
      </div>
      <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-navy">
        Your own live construction dashboard
      </h2>
      <p className="mt-4 text-warm-gray leading-relaxed max-w-xl mx-auto">
        Create a free account and build a dashboard from the Pulse data you
        actually use: grid carbon, material prices, planning activity, ONS
        output, EPC data. It is saved to your account, so it is there waiting
        every time you sign in, on any device.
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <Link
          href="/account?mode=signup&next=/my-pulse"
          className="inline-flex items-center gap-2 rounded-full bg-pink px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-pink-light"
        >
          Create your free account
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/account?next=/my-pulse"
          className="text-sm font-semibold text-navy hover:text-teal transition-colors"
        >
          Sign in
        </Link>
      </div>
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-left">
        {WIDGET_CATALOGUE.map((meta) => (
          <div
            key={meta.type}
            className="rounded-2xl bg-white border border-charcoal/[0.06] p-5"
          >
            <h3 className="text-sm font-semibold text-navy">{meta.title}</h3>
            <p className="mt-1 text-xs text-warm-gray leading-relaxed">
              {meta.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 py-8">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="h-64 animate-pulse rounded-2xl bg-white/70"
        />
      ))}
    </div>
  );
}

export function MyPulseDashboard() {
  const { status, user } = useAccount();
  const [saveError, setSaveError] = useState(false);
  const openedTracked = useRef(false);

  useEffect(() => {
    if (user && !openedTracked.current) {
      openedTracked.current = true;
      track("my_pulse_opened", { widgets: user.widgets.length });
    }
  }, [user]);

  if (status === "loading") return <LoadingSkeleton />;
  if (!user) return <SignedOutPitch />;

  const widgets = user.widgets;
  const availableToAdd = WIDGET_CATALOGUE.filter(
    (meta) => !widgets.some((w) => w.type === meta.type),
  );

  async function applyLayout(next: WidgetInstance[]) {
    updateLocalUser({ widgets: next });
    const result = await saveAccount({ widgets: next });
    setSaveError(!result.ok);
  }

  function addWidget(type: WidgetType) {
    track("my_pulse_widget_added", { widget: type });
    void applyLayout([...widgets, { type }]);
  }

  function removeWidget(type: WidgetType) {
    track("my_pulse_widget_removed", { widget: type });
    void applyLayout(widgets.filter((w) => w.type !== type));
  }

  function moveWidget(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= widgets.length) return;
    const next = [...widgets];
    [next[index], next[target]] = [next[target], next[index]];
    track("my_pulse_widget_moved", { widget: widgets[index].type });
    void applyLayout(next);
  }

  function changeConfig(type: WidgetType, config: Record<string, string>) {
    void applyLayout(
      widgets.map((w) => (w.type === type ? { ...w, config } : w)),
    );
  }

  const firstName = user.name?.split(" ")[0];

  return (
    <div className="py-2">
      <div className="mb-8 flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-sm text-warm-gray">
          {firstName ? `Welcome back, ${firstName}. ` : "Welcome back. "}
          This board is saved to your account - it will look exactly like this
          on your next visit, on any device.
        </p>
        <Link
          href="/account"
          className="text-xs font-semibold text-teal hover:text-teal-dark transition-colors"
        >
          Manage account
        </Link>
      </div>

      {saveError && (
        <div className="mb-6 rounded-xl border border-pink/30 bg-pink/5 px-4 py-3 text-sm text-navy">
          Your last change could not be saved to your account. It is still
          showing here - try making the change again in a moment.
        </div>
      )}

      {widgets.length === 0 ? (
        <div className="rounded-2xl bg-white border border-charcoal/[0.06] p-10 text-center">
          <Sparkles className="mx-auto h-6 w-6 text-teal" />
          <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-2xl font-bold text-navy">
            Your dashboard is empty
          </h2>
          <p className="mt-2 text-sm text-warm-gray">
            Add your first widget below and it will be here every time you sign
            in.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {widgets.map((widget, index) => {
            const meta = WIDGET_CATALOGUE.find((m) => m.type === widget.type);
            return (
              <section key={widget.type}>
                {/* Control bar */}
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-warm-gray">
                    {meta?.title ?? widget.type}
                  </h2>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveWidget(index, -1)}
                      disabled={index === 0}
                      aria-label={`Move ${meta?.title} up`}
                      title="Move up"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white border border-charcoal/[0.08] text-warm-gray transition-colors hover:text-navy disabled:opacity-30 disabled:hover:text-warm-gray"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveWidget(index, 1)}
                      disabled={index === widgets.length - 1}
                      aria-label={`Move ${meta?.title} down`}
                      title="Move down"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white border border-charcoal/[0.08] text-warm-gray transition-colors hover:text-navy disabled:opacity-30 disabled:hover:text-warm-gray"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeWidget(widget.type)}
                      aria-label={`Remove ${meta?.title}`}
                      title="Remove from your dashboard"
                      className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-charcoal/[0.08] text-warm-gray transition-colors hover:text-pink hover:border-pink/30"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <WidgetHost widget={widget} onConfigChange={changeConfig} />
              </section>
            );
          })}
        </div>
      )}

      {/* Add widgets */}
      {availableToAdd.length > 0 && (
        <div className="mt-12 border-t border-charcoal/[0.08] pt-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-navy mb-4">
            Add to your dashboard
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableToAdd.map((meta) => (
              <button
                key={meta.type}
                type="button"
                onClick={() => addWidget(meta.type)}
                className="group rounded-2xl bg-white border border-charcoal/[0.06] p-5 text-left transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-navy">
                    {meta.title}
                  </h3>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cream text-teal transition-colors group-hover:bg-teal group-hover:text-white">
                    <Plus className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-1 text-xs text-warm-gray leading-relaxed pr-8">
                  {meta.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
