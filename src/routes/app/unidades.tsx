import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/shell/ModulePlaceholder";
import { RequirePermission } from "@/components/shell/RequirePermission";

export const Route = createFileRoute("/app/unidades")({
  component: Page,
});

function Page() {
  return (
    <RequirePermission permission="unit.read">
      <ModulePlaceholder title="Unidades" description="Unidades e espaços de atendimento do Instituto Designio." />
    </RequirePermission>
  );
}
