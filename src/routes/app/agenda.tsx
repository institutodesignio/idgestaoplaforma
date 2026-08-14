import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/shell/ModulePlaceholder";
import { RequirePermission } from "@/components/shell/RequirePermission";

export const Route = createFileRoute("/app/agenda")({
  component: Page,
});

function Page() {
  return (
    <RequirePermission permission="appointment.read">
      <ModulePlaceholder
        title="Agenda"
        description="Agenda institucional de atendimentos, encontros e atividades."
      />
    </RequirePermission>
  );
}
