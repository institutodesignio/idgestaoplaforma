import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/shell/ModulePlaceholder";
import { RequirePermission } from "@/components/shell/RequirePermission";

export const Route = createFileRoute("/app/pessoas")({
  component: Page,
});

function Page() {
  return (
    <RequirePermission permission="person.read">
      <ModulePlaceholder title="Pessoas" description="Cadastro e acompanhamento das pessoas atendidas e da equipe do Instituto Designio." />
    </RequirePermission>
  );
}
