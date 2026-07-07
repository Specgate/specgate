import { SpecGateAppShell } from "@/components/app-shell/SpecGateAppShell";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function DashboardLayout({ children }: { children: any }): any {
  return (
    <AuthGuard>
      <SpecGateAppShell>{children}</SpecGateAppShell>
    </AuthGuard>
  );
}
