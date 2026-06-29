"use client";

import { RouterProvider } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getRouter } from "@/router";

export default function SpecPilotClient() {
  const [router, setRouter] = useState<ReturnType<typeof getRouter> | null>(null);

  useEffect(() => {
    setRouter(getRouter());
  }, []);

  if (!router) return null;

  return <RouterProvider router={router} />;
}
