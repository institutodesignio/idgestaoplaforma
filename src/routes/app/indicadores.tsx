import { createFileRoute } from "@tanstack/react-router";
import { RequirePermission } from "@/components/shell/RequirePermission";
import { IndicatorPanel } from "@/features/indicators/components/IndicatorPanel";

export const Route = createFileRoute("/app/indicadores")({
  component: IndicatorsPage,
});

function IndicatorsPage() {
  return (
    <RequirePermission
      anyPermission={["neurodivergent_profile.read", "neurodivergent_profile.manage"]}
    >
      <div className="space-y-8">
        <header>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Módulo
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            Indicadores protegidos
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Visão agregada da população neurodivergente cadastrada. Nenhuma pessoa é identificada e
            grupos pequenos permanecem protegidos.
          </p>
        </header>

        <div className="grid gap-6 xl:grid-cols-2">
          <IndicatorPanel dimension="condition" />
          <IndicatorPanel dimension="priority_need" />
        </div>
      </div>
    </RequirePermission>
  );
}