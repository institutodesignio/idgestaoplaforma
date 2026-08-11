import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequirePermission } from "@/components/shell/RequirePermission";

export const Route = createFileRoute("/app/equipe")({
  component: TeamLayout,
});

function TeamLayout() {
  return (
    <RequirePermission anyPermission={["user.read", "role.read"]}>
      <Outlet />
    </RequirePermission>
  );
}