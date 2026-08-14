import { createFileRoute, Link } from "@tanstack/react-router";
import { useInstitutionalIdentity } from "@/components/shell/AppHeader";
import { useVisibleNavItems } from "@/components/shell/AppSidebar";
import { useSession } from "@/contexts/SessionContext";

export const Route = createFileRoute("/app/")({
  component: OverviewPage,
});

function OverviewPage() {
  const { context } = useSession();
  const { name, role, organization } = useInstitutionalIdentity();
  const modules = useVisibleNavItems().filter((item) => item.to !== "/app");

  const stats = [
    { label: "Papéis institucionais", value: context?.roles.length ?? 0 },
    { label: "Permissões ativas", value: context?.permissions.length ?? 0 },
    { label: "Escopos de atuação", value: context?.scopes.length ?? 0 },
    { label: "Módulos disponíveis", value: modules.length },
  ];

  return (
    <div className="space-y-10">
      <section>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
          {organization}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Olá, {name.split(" ")[0]}.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Você está no ambiente institucional do ID Gestão como{" "}
          <span className="font-medium text-foreground">{role}</span>. Seus acessos são definidos
          pelo backend institucional.
        </p>
      </section>

      <section
        aria-label="Resumo do contexto institucional"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat) => (
          <div key={stat.label} className="surface-card rounded-2xl p-5">
            <p className="text-3xl font-semibold tracking-tight text-foreground">{stat.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </section>

      <section aria-label="Módulos liberados">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Módulos liberados para você
        </h2>
        {modules.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Nenhum módulo liberado para o seu perfil no momento.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {modules.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="surface-card flex items-center gap-4 rounded-2xl p-5 transition-colors hover:bg-secondary/60"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                    <item.icon aria-hidden="true" className="size-5" />
                  </span>
                  <span className="flex-1 font-medium text-foreground">{item.label}</span>
                  {item.planned ? (
                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      em planejamento
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {context?.scopes.length ? (
        <section aria-label="Escopos">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Escopos de atuação
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {context.scopes.map((scope) => (
              <li
                key={scope}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {scope}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
