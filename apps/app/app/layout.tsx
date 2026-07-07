import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "SpecGate — Spec-first workspace for AI-powered teams",
  description:
    "Turn messy requests into approved specs, hand clean context to coding agents, and let stakeholders preview before release.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: any;
}>): any {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
