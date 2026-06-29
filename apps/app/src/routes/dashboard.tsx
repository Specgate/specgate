import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * /dashboard → /home redirect.
 * Common alias — redirect gracefully instead of showing a 404.
 */
export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    throw redirect({ to: "/home", replace: true });
  },
});
