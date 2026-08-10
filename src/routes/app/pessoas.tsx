import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequirePermission } from "@/components/shell/RequirePermission";

export const Route = createFileRoute("/app/pessoas")({
  component: PessoasLayout,
});

function PessoasLayout() {
  return (
    <RequirePermission permission="person.read">
      <Outlet />
    </RequirePermission>
  );
}
