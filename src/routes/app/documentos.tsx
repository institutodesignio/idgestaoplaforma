import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/shell/ModulePlaceholder";
import { RequirePermission } from "@/components/shell/RequirePermission";

export const Route = createFileRoute("/app/documentos")({
  component: Page,
});

function Page() {
  return (
    <RequirePermission permission="document.read">
      <ModulePlaceholder title="Documentos" description="Documentos institucionais, registros e arquivos organizacionais." />
    </RequirePermission>
  );
}
