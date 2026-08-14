import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequirePermission } from "@/components/shell/RequirePermission";

export const Route = createFileRoute("/app/supervisao")({
  component: SupervisionLayout,
});

function SupervisionLayout() {
  return (
    <RequirePermission anyPermission={["clinical_supervision.read", "clinical_supervision.manage"]}>
      <Outlet />
    </RequirePermission>
  );
}
