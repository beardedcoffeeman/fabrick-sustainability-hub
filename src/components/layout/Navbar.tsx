"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  ArrowUpRight,
  ArrowLeft,
  ChevronDown,
  Zap,
  Package,
  Building2,
  Landmark,
  Home,
  LayoutDashboard,
  Mail,
  Check,
  BookOpen,
  Brain,
} from "lucide-react";
import { FabrickLogo } from "./FabrickLogo";

const dashboardItems = [
  {
    href: "/dashboard",
    label: "Dashboard Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/carbon-intensity",
    label: "Carbon Intensity",
    icon: Zap,
  },
  {
    href: "/dashboard/material-prices",
    label: "Material Prices",
    icon: Package,
  },
  {
    href: "/dashboard/construction-output",
    label: "Construction Output",
    icon: Building2,
  },
  {
    href: "/dashboard/planning",
    label: "Planning Activity",
    icon: Landmark,
  },
  {
    href: "/dashboard/epc",
    label: "EPC Lookup",
    icon: Home,
  },
];

const navLinks = [
  { href: "/materials", label: "Carbon Calculator" },
  { href: "/regulations", label: "Regulations" },
];

const insightsItems = [
  {
    href: "/knowledge",
    label: "Knowledge Hub",
    icon: BookOpen,
    description: "Plain-English guides",
  },
  {
    href: "/research",
    label: "Original Research",
    icon: Brain,
    description: "Fabrick-owned studies",
  },
];

// Newsletter CTA with inline email reveal - opens on click or hover, makes it
// one-step to subscribe without leaving the page.
function NewsletterCTA({
  variant = "desktop",
  onAction,
}: {
  variant?: "desktop" | "mobile";
  onAction?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleHoverIn() {
    if (variant !== "desktop") return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function handleHoverOut() {
    if (variant !== "desktop") return;
    closeTimer.current = setTimeout(() => setOpen(false), 250);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setOpen(false);
      onAction?.();
    }, 1800);
  }

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={handleHoverIn}
      onMouseLeave={handleHoverOut}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="newsletter-cta-panel"
        className={
          variant === "desktop"
            ? "inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white hover:text-navy whitespace-nowrap"
            : "flex items-center justify-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white w-full"
        }
      >
        <Mail className="h-4 w-4" />
        Monthly trends
      </button>

      {open && (
        <div
          id="newsletter-cta-panel"
          className={
            variant === "desktop"
              ? "absolute right-0 top-full mt-2 w-80 rounded-2xl bg-charcoal shadow-2xl border border-white/10 p-5 z-50"
              : "mt-3 rounded-2xl bg-charcoal/80 border border-white/10 p-5"
          }
        >
          {!submitted ? (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pink mb-2">
                The Data Point
              </p>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-white leading-tight mb-1">
                One email a month. Built environment trends, decoded.
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                Material price moves, regulatory shifts, grid carbon trends.
                Straight to your inbox. No spam.
              </p>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  aria-label="Email address"
                  className="flex-1 rounded-full bg-navy-light px-4 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal/40 border border-gray-700"
                />
                <button
                  type="submit"
                  className="rounded-full bg-pink px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-pink-light whitespace-nowrap"
                >
                  Sign up
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center gap-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal">
                <Check className="h-4 w-4 text-charcoal" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  You&rsquo;re on the list.
                </p>
                <p className="text-xs text-gray-400">
                  First issue lands next month.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [mobileDashboardOpen, setMobileDashboardOpen] = useState(false);
  const [mobileInsightsOpen, setMobileInsightsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const insightsRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insightsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDashboardOpen(false);
      }
      if (
        insightsRef.current &&
        !insightsRef.current.contains(e.target as Node)
      ) {
        setInsightsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleMouseEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDashboardOpen(true);
  }

  function handleMouseLeave() {
    timeoutRef.current = setTimeout(() => setDashboardOpen(false), 150);
  }

  function handleInsightsEnter() {
    if (insightsTimer.current) clearTimeout(insightsTimer.current);
    setInsightsOpen(true);
  }

  function handleInsightsLeave() {
    insightsTimer.current = setTimeout(() => setInsightsOpen(false), 150);
  }

  return (
    <>
      {/* Top bar - back to main Fabrick site */}
      <div className="bg-charcoal text-gray-400 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-8 items-center justify-between">
            <a
              href="https://www.fabrick.agency"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to our marketing services
            </a>
            <a
              href="https://www.fabrick.agency/contact-us"
              className="hidden sm:flex items-center gap-1 hover:text-white transition-colors"
            >
              Get in touch
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="sticky top-0 z-50 bg-navy text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <FabrickLogo fill="#ffffff" height={30} />
              <span className="hidden text-xs font-medium text-warm-gray sm:block">
                Built Environment Data
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-8 md:flex">
              {/* Live Dashboards dropdown */}
              <div
                ref={dropdownRef}
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className="flex items-center gap-1 text-sm font-medium text-gray-300 transition-colors hover:text-white"
                  onClick={() => setDashboardOpen(!dashboardOpen)}
                >
                  Live Dashboards
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${dashboardOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown */}
                {dashboardOpen && (
                  <div className="absolute left-1/2 top-full -translate-x-1/2 pt-2">
                    <div className="w-56 rounded-xl bg-navy-light shadow-xl border border-white/10 py-2 overflow-hidden">
                      {dashboardItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                            onClick={() => setDashboardOpen(false)}
                          >
                            <Icon className="h-4 w-4 text-teal shrink-0" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Flat nav links */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}

              {/* Insights dropdown (Knowledge + Research) */}
              <div
                ref={insightsRef}
                className="relative"
                onMouseEnter={handleInsightsEnter}
                onMouseLeave={handleInsightsLeave}
              >
                <button
                  className="flex items-center gap-1 text-sm font-medium text-gray-300 transition-colors hover:text-white"
                  onClick={() => setInsightsOpen(!insightsOpen)}
                >
                  Insights
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${insightsOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {insightsOpen && (
                  <div className="absolute left-1/2 top-full -translate-x-1/2 pt-2">
                    <div className="w-64 rounded-xl bg-navy-light shadow-xl border border-white/10 py-2 overflow-hidden">
                      {insightsItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-start gap-3 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                            onClick={() => setInsightsOpen(false)}
                          >
                            <Icon className="h-4 w-4 text-teal shrink-0 mt-0.5" />
                            <span>
                              <span className="block">{item.label}</span>
                              <span className="block text-[11px] text-gray-500 mt-0.5">
                                {item.description}
                              </span>
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <NewsletterCTA variant="desktop" />
              <a
                href="https://www.fabrick.agency/contact-us"
                className="inline-flex items-center gap-2 rounded-full bg-pink px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-pink-light"
              >
                Get in touch
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="border-t border-navy-light md:hidden">
            <div className="space-y-1 px-4 pb-4 pt-2">
              {/* Live Dashboards with expandable sub-items */}
              <button
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-base font-medium text-gray-300 transition-colors hover:bg-navy-light hover:text-white"
                onClick={() => setMobileDashboardOpen(!mobileDashboardOpen)}
              >
                Live Dashboards
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${mobileDashboardOpen ? "rotate-180" : ""}`}
                />
              </button>
              {mobileDashboardOpen && (
                <div className="ml-4 space-y-0.5">
                  {dashboardItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-navy-light hover:text-white"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-3.5 w-3.5 text-teal shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Flat nav links */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-gray-300 transition-colors hover:bg-navy-light hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Insights expandable */}
              <button
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-base font-medium text-gray-300 transition-colors hover:bg-navy-light hover:text-white"
                onClick={() => setMobileInsightsOpen(!mobileInsightsOpen)}
              >
                Insights
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${mobileInsightsOpen ? "rotate-180" : ""}`}
                />
              </button>
              {mobileInsightsOpen && (
                <div className="ml-4 space-y-0.5">
                  {insightsItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-navy-light hover:text-white"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-3.5 w-3.5 text-teal shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}

              <div className="mt-2">
                <NewsletterCTA
                  variant="mobile"
                  onAction={() => setIsOpen(false)}
                />
              </div>
              <a
                href="https://www.fabrick.agency/contact-us"
                className="mt-2 flex items-center justify-center gap-2 rounded-full bg-pink px-5 py-2.5 text-sm font-semibold text-white"
                onClick={() => setIsOpen(false)}
              >
                Get in touch
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
