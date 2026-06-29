import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpecPilot - Spec-first workspace for AI-powered teams",
  description:
    "Turn messy requests into approved specs, hand clean context to coding agents, and let stakeholders preview before release.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
