import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/shell/ModulePlaceholder";
import { RequirePermission } from "@/components/shell/RequirePermission";

export const Route = createFileRoute("/app/financeiro")({
  component: Page,
});

function Page() {
  return (
    <RequirePermission permission="finance.read">
      <ModulePlaceholder
        title="Financeiro"
        description="Gestão financeira institucional, repasses e prestação de contas."
      />
    </RequirePermission>
  );
}
