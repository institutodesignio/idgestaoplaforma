import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useSession } from "@/contexts/SessionContext";

/**
 * Proteção de rota por permissão — sempre baseada no retorno de /api/v1/me.
 */
export function RequirePermission({
  permission,
  anyPermission,
  children,
}: {
  permission?: string;
  anyPermission?: string[];
  children: ReactNode;
}) {
  const { hasPermission, hasAnyPermission } = useSession();

  const allowed = permission
    ? hasPermission(permission)
    : anyPermission
      ? hasAnyPermission(anyPermission)
      : true;

  if (allowed) return <>{children}</>;

  return (
    <section className="surface-card mx-auto max-w-lg rounded-2xl p-8 text-center">
      <h1 className="text-lg font-semibold tracking-tight text-foreground">
        Acesso não autorizado
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Seu perfil institucional não possui permissão para acessar este módulo. Fale com a
        administração do Instituto Designio se precisar deste acesso.
      </p>
      <Link
        to="/app"
        className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Voltar à visão geral
      </Link>
    </section>
  );
}
