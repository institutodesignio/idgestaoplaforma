import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { RequirePermission } from "@/components/shell/RequirePermission";
import { IntakeWizard } from "@/features/neurodivergent/components/intake-wizard/IntakeWizard";

export const Route = createFileRoute("/app/cadastro-neurodivergente/novo")({
  component: NewIntakePage,
});

function NewIntakePage() {
  return (
    <RequirePermission permission="neurodivergent_profile.manage">
      <div className="space-y-8">
        <Link
          to="/app/cadastro-neurodivergente"
          search={{ page: 1, status: "", search: "" }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Cadastros
        </Link>

        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Novo cadastro</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Sete etapas curtas, em ritmo tranquilo. Você pode voltar a qualquer momento antes de
            enviar.
          </p>
        </header>

        <IntakeWizard />
      </div>
    </RequirePermission>
  );
}
