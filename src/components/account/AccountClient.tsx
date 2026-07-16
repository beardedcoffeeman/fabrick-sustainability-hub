"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight, LogOut, Trash2, UserRound } from "lucide-react";
import { ROLES } from "@/components/home/RoleSelector";
import { track } from "@/lib/analytics";
import {
  deleteAccount,
  login,
  logout,
  saveAccount,
  signup,
  useAccount,
} from "@/lib/useAccount";

// ---------------------------------------------------------------------------
// /account - sign in / create account when signed out; profile management
// (name, role, sign out, delete) when signed in.
// ---------------------------------------------------------------------------

const inputCls =
  "w-full rounded-xl border border-charcoal/[0.12] bg-white px-4 py-2.5 text-sm text-navy placeholder:text-warm-gray/60 focus:outline-none focus:ring-2 focus:ring-teal";
const labelCls = "block text-xs font-semibold text-navy mb-1.5";

function PrivacyNote() {
  return (
    <p className="mt-6 text-[11px] leading-relaxed text-warm-gray">
      We store your name, email, role and dashboard set-up so your Pulse is
      there on every device. We never sell your data, and Fabrick may
      occasionally contact you about Pulse. You can delete your account - and
      everything stored with it - from this page at any time.
    </p>
  );
}

function AuthForms({ next }: { next: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">(
    params.get("mode") === "signup" ? "signup" : "signin",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("all");
  const [subscribe, setSubscribe] = useState(false);
  const [company, setCompany] = useState(""); // honeypot
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const result =
      mode === "signup"
        ? await signup({ email, password, name, role, subscribe, company })
        : await login({ email, password });
    if (result.ok) {
      track(mode === "signup" ? "account_created" : "account_signed_in");
      router.push(next);
    } else {
      setError(result.error ?? "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      {/* Mode toggle */}
      <div className="mb-8 grid grid-cols-2 rounded-full bg-cream-dark p-1 text-sm font-semibold">
        {(
          [
            ["signin", "Sign in"],
            ["signup", "Create account"],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`rounded-full py-2 transition-colors ${
              mode === m ? "bg-white text-navy shadow-sm" : "text-warm-gray"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <>
            <div>
              <label htmlFor="acc-name" className={labelCls}>
                Name
              </label>
              <input
                id="acc-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="acc-role" className={labelCls}>
                Your role
              </label>
              <select
                id="acc-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={inputCls}
              >
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id === "all" ? "Just exploring" : r.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div>
          <label htmlFor="acc-email" className={labelCls}>
            Email
          </label>
          <input
            id="acc-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.co.uk"
            autoComplete="email"
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="acc-password" className={labelCls}>
            Password
          </label>
          <input
            id="acc-password"
            type="password"
            required
            minLength={mode === "signup" ? 8 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={
              mode === "signup" ? "At least 8 characters" : "Your password"
            }
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
            className={inputCls}
          />
        </div>

        {/* Honeypot - hidden from real users, bots fill everything */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="acc-company">Company</label>
          <input
            id="acc-company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        {mode === "signup" && (
          <label className="flex items-start gap-2.5 text-xs text-warm-gray leading-relaxed cursor-pointer">
            <input
              type="checkbox"
              checked={subscribe}
              onChange={(e) => setSubscribe(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-charcoal/20 accent-[#00BFA5]"
            />
            Also send me The signal before the noise - Pulse&apos;s short email
            on what&apos;s moving in UK construction data.
          </label>
        )}

        {error && (
          <p className="rounded-xl border border-pink/30 bg-pink/5 px-4 py-3 text-sm text-navy">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-pink px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-pink-light disabled:opacity-60"
        >
          {busy
            ? "One moment..."
            : mode === "signup"
              ? "Create my free account"
              : "Sign in"}
          {!busy && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      {mode === "signin" && (
        <p className="mt-4 text-center text-xs text-warm-gray">
          Forgotten your password? Email{" "}
          <a
            href="mailto:hello@fabrick.agency?subject=Pulse%20password%20reset"
            className="font-semibold text-teal hover:text-teal-dark"
          >
            hello@fabrick.agency
          </a>{" "}
          and we will sort it.
        </p>
      )}

      <PrivacyNote />
    </div>
  );
}

function AccountPanel() {
  const { user } = useAccount();
  const router = useRouter();
  const [name, setName] = useState(user?.name ?? "");
  const [role, setRole] = useState(user?.role ?? "all");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    const result = await saveAccount({ name, role });
    setBusy(false);
    if (result.ok) {
      setSaved(true);
    } else {
      setError(result.error ?? "Could not save changes.");
    }
  }

  async function handleDelete() {
    setBusy(true);
    const result = await deleteAccount();
    if (result.ok) {
      router.push("/");
    } else {
      setError(result.error ?? "Could not delete account.");
      setBusy(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
          <UserRound className="h-5 w-5 text-teal" />
        </div>
        <div>
          <p className="text-sm font-semibold text-navy">{user.email}</p>
          <Link
            href="/my-pulse"
            className="text-xs font-semibold text-teal hover:text-teal-dark transition-colors"
          >
            Go to My Pulse
          </Link>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label htmlFor="acc-name" className={labelCls}>
            Name
          </label>
          <input
            id="acc-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="acc-role" className={labelCls}>
            Your role
          </label>
          <select
            id="acc-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={inputCls}
          >
            {ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.id === "all" ? "Just exploring" : r.label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="rounded-xl border border-pink/30 bg-pink/5 px-4 py-3 text-sm text-navy">
            {error}
          </p>
        )}
        {saved && (
          <p className="rounded-xl border border-teal/30 bg-teal/5 px-4 py-3 text-sm text-navy">
            Saved.
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-navy-light disabled:opacity-60"
        >
          Save changes
        </button>
      </form>

      <div className="mt-10 space-y-3 border-t border-charcoal/[0.08] pt-6">
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-teal transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
        <div>
          {confirmDelete ? (
            <div className="rounded-xl border border-pink/30 bg-pink/5 p-4 text-sm text-navy">
              <p>
                This permanently deletes your account, your dashboard and
                everything we store about you. There is no undo.
              </p>
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={busy}
                  className="rounded-full bg-pink px-4 py-1.5 text-xs font-semibold text-white hover:bg-pink-light disabled:opacity-60"
                >
                  Yes, delete everything
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-full border border-charcoal/[0.12] bg-white px-4 py-1.5 text-xs font-semibold text-navy"
                >
                  Keep my account
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-warm-gray hover:text-pink transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete my account
            </button>
          )}
        </div>
      </div>

      <PrivacyNote />
    </div>
  );
}

export function AccountClient() {
  const { status, user } = useAccount();
  const params = useSearchParams();
  const rawNext = params.get("next") ?? "/my-pulse";
  // Only allow same-site relative redirects.
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/my-pulse";

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-md space-y-4 py-4">
        <div className="h-10 animate-pulse rounded-full bg-white/70" />
        <div className="h-64 animate-pulse rounded-2xl bg-white/70" />
      </div>
    );
  }

  return user ? <AccountPanel /> : <AuthForms next={next} />;
}
