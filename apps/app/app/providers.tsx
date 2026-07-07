"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "@corely/ui";
import { SpecGateStoreProvider } from "@/lib/specgate-store";
import { AuthProvider } from "@/components/auth/auth-provider";
import { authClient } from "@/lib/auth/auth-client";

export function Providers({ children }: { children: any }): any {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider authClient={authClient} onLogout={() => queryClient.clear()}>
        <SpecGateStoreProvider>
          {children}
          <Toaster theme="dark" position="bottom-right" richColors />
        </SpecGateStoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
