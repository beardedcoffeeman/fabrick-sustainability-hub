import type { Metadata } from "next";

// The page itself is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "UK Planning Applications Explorer: Conditions Data | Fabrick",
  description:
    "Explore real UK planning applications and decision-notice conditions. Filter by authority, sector and condition type to see what planners are actually requiring - from BNG to noise and drainage.",
};

export default function PlanningExplorerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
