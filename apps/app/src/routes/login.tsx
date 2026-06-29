import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthCard } from "@/components/auth/auth-card";
import { authClient } from "@/lib/auth/auth-client";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (authClient.getAccessToken()) {
      throw redirect({
        to: "/",
      });
    }
  },
  component: LoginComponent,
});

function LoginComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <AuthCard />
      </div>
    </div>
  );
}
