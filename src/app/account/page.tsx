import { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { AccountClient } from "@/components/account/AccountClient";

export const metadata: Metadata = {
  title: "Your Pulse Account | Fabrick",
  description:
    "Sign in or create a free Pulse account to build your own live UK construction data dashboard and keep it on every device.",
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-charcoal py-10 pb-6 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[{ label: "Home", href: "/" }, { label: "Account" }]}
          />
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold md:text-5xl">
            Your Pulse account
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-400">
            Free, and it makes Pulse yours: your role, your pinned dashboards
            and your own My Pulse board, on every device.
          </p>
        </div>
      </section>

      {/* Forms / profile */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Suspense fallback={null}>
          <AccountClient />
        </Suspense>
      </section>
    </div>
  );
}
