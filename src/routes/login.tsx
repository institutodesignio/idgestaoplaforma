import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { InstitutionalPanel } from "@/components/branding/InstitutionalPanel";
import { LoginCard } from "@/components/auth/LoginCard";
import { useAuth } from "@/hooks/useAuth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    error: typeof search["error"] === "string" ? (search["error"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Entrar | ID Gestão — Instituto Designio" },
      {
        name: "description",
        content:
          "Acesso institucional à plataforma ID Gestão do Instituto Designio. Cuidado, gestão e impacto em um só ambiente.",
      },
      { property: "og:title", content: "Entrar | ID Gestão — Instituto Designio" },
      {
        property: "og:description",
        content: "Plataforma de Gestão e Projetos do Instituto Designio.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { error: errorParam } = Route.useSearch();
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(errorParam ?? null);

  useEffect(() => {
    if (session) void navigate({ to: "/app", replace: true });
  }, [session, navigate]);

  async function handleGoogleSignIn() {
    if (!isSupabaseConfigured) {
      setError(
        "Conexão com o Supabase institucional ainda não configurada nesta aplicação. Informe as credenciais públicas do projeto existente.",
      );
      return;
    }

    setError(null);
    setSigningIn(true);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    if (oauthError) {
      setSigningIn(false);
      setError("Não foi possível iniciar o acesso com o Google. Tente novamente em instantes.");
    }
  }

  return (
    <main className="grid min-h-dvh grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      <InstitutionalPanel />

      <div className="flex items-center justify-center bg-background px-5 py-12 sm:px-10">
        <LoginCard
          onGoogleSignIn={handleGoogleSignIn}
          loading={signingIn}
          disabled={sessionLoading}
          error={error}
        />
      </div>
    </main>
  );
}
