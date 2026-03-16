import type { Metadata } from "next";
import localFont from "next/font/local";
import { EB_Garamond, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// sans (primary)
const adelleSans = localFont({
  variable: "--font-sans",
  display: "swap",
  src: [
    { path: "./fonts/adelle-sans/adelle-sans-w01-ultrathin-italic.woff2", weight: "50", style: "italic" },
    { path: "./fonts/adelle-sans/adelle-sans-w01-thin.woff2", weight: "100", style: "normal" },
    { path: "./fonts/adelle-sans/adelle-sans-w01-thin-italic.woff2", weight: "100", style: "italic" },
    { path: "./fonts/adelle-sans/adelle-sans-w01-light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/adelle-sans/adelle-sans-w01-light-italic.woff2", weight: "300", style: "italic" },
    { path: "./fonts/adelle-sans/adelle-sans-w01-regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/adelle-sans/adelle-sans-w01-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/adelle-sans/adelle-sans-w01-semibold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/adelle-sans/adelle-sans-w01-semibold-italic.woff2", weight: "600", style: "italic" },
    { path: "./fonts/adelle-sans/adelle-sans-w01-bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/adelle-sans/adelle-sans-w01-bold-italic.woff2", weight: "700", style: "italic" },
    { path: "./fonts/adelle-sans/adelle-sans-w01-extrabold.woff2", weight: "800", style: "normal" },
    { path: "./fonts/adelle-sans/adelle-sans-w01-extrabold-italic.woff2", weight: "800", style: "italic" },
    { path: "./fonts/adelle-sans/adelle-sans-w01-heavy.woff2", weight: "900", style: "normal" },
    { path: "./fonts/adelle-sans/adelle-sans-w01-heavy-italic.woff2", weight: "900", style: "italic" },
  ],
});

// serif
const ebGaramond = EB_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
});

// mono
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Impossibl",
  description: "For the ones who don't fear the Impossibl.",
  openGraph: {
    title: "Impossibl",
    description: "For the ones who don't fear the Impossibl.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Impossibl",
    description: "For the ones who don't fear the Impossibl.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${adelleSans.variable} ${ebGaramond.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
