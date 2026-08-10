import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/shell/ModulePlaceholder";
import { RequirePermission } from "@/components/shell/RequirePermission";

export const Route = createFileRoute("/app/administracao")({
  component: Page,
});

function Page() {
  return (
    <RequirePermission anyPermission={["admin.read","organization.manage","role.read","role.manage","permission.read","user.manage","membership.manage"]}>
      <ModulePlaceholder title="Administração" description="Configurações institucionais, papéis, permissões e vínculos organizacionais." />
    </RequirePermission>
  );
}
