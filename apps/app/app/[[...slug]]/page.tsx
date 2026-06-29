"use client";

import dynamic from "next/dynamic";

const SpecPilotClient = dynamic(() => import("@/app/SpecPilotClient"), {
  ssr: false,
});

export default function SpecPilotPage() {
  return <SpecPilotClient />;
}
