import type { Metadata } from "next";
import HomeContent from "@/components/home-content";

export const metadata: Metadata = {
  title: "Impossibl @ SF, March 24",
  description: "For the ones who don't fear the Impossibl. A hackathon in San Francisco, March 24.",
  openGraph: {
    title: "Impossibl @ SF, March 24",
    description: "For the ones who don't fear the Impossibl. A hackathon in San Francisco, March 24.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Impossibl @ SF, March 24",
    description: "For the ones who don't fear the Impossibl. A hackathon in San Francisco, March 24.",
  },
};

export default function Home() {
  return <HomeContent />;
}
