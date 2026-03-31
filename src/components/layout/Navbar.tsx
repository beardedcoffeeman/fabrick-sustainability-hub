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
  { href: "/knowledge", label: "Knowledge Hub" },
  { href: "/research", label: "Research" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [mobileDashboardOpen, setMobileDashboardOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDashboardOpen(false);
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

              {/* Other nav links */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
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

              {/* Other nav links */}
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
