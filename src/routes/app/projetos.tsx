import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequirePermission } from "@/components/shell/RequirePermission";

export const Route = createFileRoute("/app/projetos")({
  component: ProjectsLayout,
});

function ProjectsLayout() {
  return (
    <RequirePermission permission="project.read">
      <Outlet />
    </RequirePermission>
  );
}
