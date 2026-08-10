import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/shell/ModulePlaceholder";
import { RequirePermission } from "@/components/shell/RequirePermission";

export const Route = createFileRoute("/app/projetos")({
  component: Page,
});

function Page() {
  return (
    <RequirePermission permission="project.read">
      <ModulePlaceholder title="Projetos" description="Projetos institucionais, metas e acompanhamento de impacto." />
    </RequirePermission>
  );
}
