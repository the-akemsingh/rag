import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AppShell } from "@/components/app/app-shell";

export const Route = createFileRoute("/dashboard")({
  component: WorkspaceLayout,
});

function WorkspaceLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
