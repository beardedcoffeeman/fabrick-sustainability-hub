import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Director's Brief",
  robots: { index: false, follow: false },
};

export default function DirectorLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-stone-50 text-slate-900">{children}</div>;
}
