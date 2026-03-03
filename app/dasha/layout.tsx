import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dasha | Impossibl",
};

export default function DashaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-white min-h-screen">{children}</div>;
}
