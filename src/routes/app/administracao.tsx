import { createFileRoute, Link } from "@tanstack/react-router";
import { MailPlus, ScrollText, Users } from "lucide-react";
import { useState } from "react";
import { RequirePermission } from "@/components/shell/RequirePermission";
import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/SessionContext";
import { MemberInviteDialog } from "@/features/members/components/MemberInviteDialog";

export const Route = createFileRoute("/app/administracao")({
  component: Page,
});

function Page() {
  return (
    <RequirePermission
      anyPermission={[
        "admin.read",
        "organization.manage",
        "role.read",
        "role.manage",
        "permission.read",
        "user.manage",
        "user.invite",
        "audit.read",
        "membership.manage",
      ]}
    >
      <AdminPage />
    </RequirePermission>
  );
}

function AdminPage() {
  const { can } = useSession();
  // O convite exige as duas permissões oficiais; sem ambas, a ação não é exibida.
  const canInvite = can("user.invite") && can("user.manage_roles");
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Módulo
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
          Administração
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Convites institucionais, gestão da equipe e trilha de auditoria.
        </p>
      </header>

      <section aria-label="Ações administrativas" className="grid gap-4 sm:grid-cols-2">
        {canInvite ? (
          <div className="surface-card space-y-3 rounded-2xl p-6">
            <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <MailPlus aria-hidden="true" className="size-5" />
            </span>
            <h2 className="text-base font-semibold text-foreground">Cadastro de profissionais</h2>
            <p className="text-sm text-muted-foreground">
              Cadastre técnicos e administrativos, definindo função, acesso e e-mail institucional.
            </p>
            <Button onClick={() => setInviteOpen(true)}>Cadastrar profissional</Button>
          </div>
        ) : null}

        {can("user.read") || can("role.read") ? (
          <div className="surface-card space-y-3 rounded-2xl p-6">
            <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <Users aria-hidden="true" className="size-5" />
            </span>
            <h2 className="text-base font-semibold text-foreground">Equipe institucional</h2>
            <p className="text-sm text-muted-foreground">
              Membros, papéis e histórico temporal de atuação.
            </p>
            <Button asChild variant="outline">
              <Link to="/app/equipe" search={{ page: 1, search: "" }}>
                Abrir equipe
              </Link>
            </Button>
          </div>
        ) : null}

        {can("audit.read") ? (
          <div className="surface-card space-y-3 rounded-2xl p-6">
            <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <ScrollText aria-hidden="true" className="size-5" />
            </span>
            <h2 className="text-base font-semibold text-foreground">Trilha de auditoria</h2>
            <p className="text-sm text-muted-foreground">
              Consulte as ações registradas no ambiente institucional.
            </p>
            <Button asChild variant="outline">
              <Link to="/app/auditoria" search={{ page: 1, resource: "" }}>
                Abrir auditoria
              </Link>
            </Button>
          </div>
        ) : null}
      </section>

      <MemberInviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}
