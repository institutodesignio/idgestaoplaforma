import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/branding/BrandMark";
import { useAuth, useSignOut } from "@/hooks/useAuth";

export const Route = createFileRoute("/app")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Ambiente institucional | ID Gestão" },
      {
        name: "description",
        content: "Área autenticada da plataforma ID Gestão do Instituto Designio.",
      },
      { property: "og:title", content: "Ambiente institucional | ID Gestão" },
      {
        property: "og:description",
        content: "Área autenticada da plataforma ID Gestão do Instituto Designio.",
      },
    ],
  }),
  component: AppPage,
});

function AppPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const signOut = useSignOut();
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/login", search: {}, replace: true });
  }, [loading, user, navigate]);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    void navigate({ to: "/login", search: {}, replace: true });
  }

  if (loading || !user) {
    return (
      <main
        className="flex min-h-dvh items-center justify-center bg-background"
        aria-busy="true"
        aria-live="polite"
      >
        <span
          aria-hidden="true"
          className="size-7 animate-spin rounded-full border-2 border-muted border-t-primary"
        />
        <span className="sr-only">Carregando sessão</span>
      </main>
    );
  }

  const name =
    (user.user_metadata?.['full_name'] as string | undefined) ??
    (user.user_metadata?.['name'] as string | undefined) ??
    "Colaborador";
  const avatar =
    (user.user_metadata?.['avatar_url'] as string | undefined) ??
    (user.user_metadata?.['picture'] as string | undefined);

  return (
    <main className="min-h-dvh bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <BrandMark className="h-9 w-auto" />
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            aria-busy={signingOut ? "true" : "false"}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {signingOut ? "Saindo…" : "Sair"}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
          ID Gestão
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Autenticação realizada com sucesso.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Tela temporária de validação. Roles, permissions e o dashboard serão definidos nas
          próximas etapas pelo backend.
        </p>

        <section className="surface-card mt-10 flex max-w-md items-center gap-4 rounded-2xl p-6">
          {avatar ? (
            <img
              src={avatar}
              alt={`Foto de perfil de ${name}`}
              className="size-14 rounded-full border border-border object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex size-14 items-center justify-center rounded-full bg-secondary text-lg font-semibold text-secondary-foreground"
            >
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{name}</p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
        </section>
      </div>
    </main>
  );
}