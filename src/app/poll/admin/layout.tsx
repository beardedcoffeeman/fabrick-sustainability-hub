import type { Metadata } from "next";

// Internal passcode-gated page - keep it out of search engines.
export const metadata: Metadata = {
  title: "Poll Admin | Pulse",
  robots: { index: false, follow: false },
};

export default function PollAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
