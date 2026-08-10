import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/shell/AppHeader";
import { AppSidebar } from "@/components/shell/AppSidebar";
import { FullScreenLoader, StateMessage } from "@/components/shell/StateScreens";
import { SessionProvider, useSession } from "@/contexts/SessionContext";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/app")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Ambiente institucional | ID Gestão" },
      {
        name: "description",
        content:
          "Ambiente institucional da plataforma ID Gestão do Instituto Designio: pessoas, projetos, unidades e gestão.",
      },
      { property: "og:title", content: "Ambiente institucional | ID Gestão" },
      {
        property: "og:description",
        content: "Gestão institucional do Instituto Designio em um só ambiente.",
      },
    ],
  }),
  component: AppLayoutRoute,
});

function AppLayoutRoute() {
  return (
    <SessionProvider>
      <AppGate />
    </SessionProvider>
  );
}

function AppGate() {
  const navigate = useNavigate();
  const { status, reload } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      void navigate({ to: "/login", search: { error: undefined }, replace: true });
    }
  }, [status, navigate]);

  if (status === "loading" || status === "unauthenticated") {
    return <FullScreenLoader />;
  }

  if (status === "expired") {
    return (
      <StateMessage
        title="Sua sessão expirou"
        description="Por segurança, o acesso institucional foi encerrado. Entre novamente com sua conta Google para continuar."
        actionLabel="Entrar novamente"
        onAction={async () => {
          await supabase.auth.signOut();
          void navigate({ to: "/login", search: { error: undefined }, replace: true });
        }}
      />
    );
  }

  if (status === "no_context") {
    return (
      <StateMessage
        title="Acesso ainda não liberado"
        description="Sua autenticação foi concluída, mas ainda não existe um vínculo institucional ativo para esta conta. Solicite a liberação do seu acesso à administração do Instituto Designio."
        actionLabel="Tentar novamente"
        onAction={reload}
        secondaryLabel="Sair"
        onSecondary={async () => {
          await supabase.auth.signOut();
          void navigate({ to: "/login", search: { error: undefined }, replace: true });
        }}
      />
    );
  }

  if (status === "error") {
    return (
      <StateMessage
        title="Não conseguimos carregar seu contexto"
        description="O servidor institucional está temporariamente indisponível. Tente novamente em alguns instantes."
        actionLabel="Tentar novamente"
        onAction={reload}
      />
    );
  }

  return <AppShell />;
}

function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="hidden lg:block">
        <div className="sticky top-0 h-dvh">
          <AppSidebar />
        </div>
      </aside>

      {menuOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu de navegação"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-foreground/40"
          />
          <div className="absolute inset-y-0 left-0 shadow-xl">
            <AppSidebar onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader onOpenMenu={() => setMenuOpen(true)} />
        <main className="flex-1 px-5 py-8 sm:px-8 sm:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
