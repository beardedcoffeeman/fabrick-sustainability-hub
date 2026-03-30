"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ArrowUpRight, ArrowLeft } from "lucide-react";
import { FabrickLogo } from "./FabrickLogo";

const navLinks = [
  { href: "/dashboard", label: "Live Dashboard" },
  { href: "/materials", label: "Carbon Calculator" },
  { href: "/regulations", label: "Regulations" },
  { href: "/knowledge", label: "Knowledge Hub" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

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
