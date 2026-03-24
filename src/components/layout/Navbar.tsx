"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ArrowUpRight, Leaf } from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "Live Dashboard" },
  { href: "/materials", label: "Carbon Calculator" },
  { href: "/regulations", label: "Regulations" },
  { href: "/knowledge", label: "Knowledge Hub" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-navy text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Leaf className="h-6 w-6 text-teal" />
              <span className="text-xl font-bold tracking-tight">FABRICK</span>
            </div>
            <span className="hidden text-xs font-medium text-warm-gray sm:block">
              Sustainability Hub
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
            <Link
              href="/knowledge"
              className="inline-flex items-center gap-2 rounded-full bg-pink px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-pink-light"
            >
              Get Started
              <ArrowUpRight className="h-4 w-4" />
            </Link>
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
            <Link
              href="/knowledge"
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-pink px-5 py-2.5 text-sm font-semibold text-white"
              onClick={() => setIsOpen(false)}
            >
              Get Started
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
