"use client";

import { useState } from "react";
import Link from "next/link";
import { Leaf, ArrowUpRight, CheckCircle } from "lucide-react";

export function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-1.5">
              <Leaf className="h-6 w-6 text-teal" />
              <span className="text-xl font-bold tracking-tight">FABRICK</span>
            </div>
            <p className="mt-3 text-sm text-warm-gray">
              Marketing specialists for the built environment. Driving
              sustainability through data, insight, and creativity.
            </p>
          </div>

          {/* Hub Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-pink">
              Hub
            </h4>
            <ul className="mt-4 space-y-2">
              {[
                ["Live Dashboard", "/dashboard"],
                ["Carbon Calculator", "/materials"],
                ["Regulations", "/regulations"],
                ["Knowledge Hub", "/knowledge"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-warm-gray transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-pink">
              Resources
            </h4>
            <ul className="mt-4 space-y-2">
              {[
                ["Embodied Carbon Guide", "/knowledge/what-is-embodied-carbon"],
                ["Part Z Explained", "/knowledge/part-z-explained"],
                ["Future Homes Standard", "/knowledge/future-homes-standard-2026"],
                ["What Is an EPD?", "/knowledge/what-is-epd"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-warm-gray transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-pink">
              Stay Updated
            </h4>
            {subscribed ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-teal">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>Subscribed! We&apos;ll be in touch.</span>
              </div>
            ) : (
              <>
                <p className="mt-4 text-sm text-warm-gray">
                  Get regulatory alerts and carbon data insights delivered to your
                  inbox.
                </p>
                <form
                  className="mt-4 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (email.trim()) setSubscribed(true);
                  }}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 rounded-full bg-navy-light px-4 py-2 text-sm text-white placeholder-warm-gray outline-none focus:ring-2 focus:ring-teal"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-pink px-4 py-2 text-sm font-semibold transition-colors hover:bg-pink-light"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        <div className="mt-12 border-t border-navy-light pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-warm-gray">
              &copy; {new Date().getFullYear()} Fabrick. All rights reserved. Built
              for the UK construction industry.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-warm-gray">
                Data sources: Carbon Intensity API, ICE Database, BECD
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
