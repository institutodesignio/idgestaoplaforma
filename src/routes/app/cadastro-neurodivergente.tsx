import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequirePermission } from "@/components/shell/RequirePermission";

export const Route = createFileRoute("/app/cadastro-neurodivergente")({
  component: IntakeLayout,
});

function IntakeLayout() {
  return (
    <RequirePermission
      anyPermission={["neurodivergent_profile.read", "neurodivergent_profile.manage"]}
    >
      <Outlet />
    </RequirePermission>
  );
}
