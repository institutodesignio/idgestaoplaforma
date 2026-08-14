import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/branding/BrandMark";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Validando seu acesso institucional…");

  useEffect(() => {
    let active = true;

    async function resolveSession() {
      // Erro devolvido pelo provedor / Supabase via query ou hash.
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
      const providerError =
        url.searchParams.get("error_description") ??
        url.searchParams.get("error") ??
        hash.get("error_description") ??
        hash.get("error");

      if (providerError) {
        redirectWithError("Não foi possível concluir o acesso com o Google.");
        return;
      }

      // O SDK conclui a troca do código (PKCE) automaticamente; aguardamos a sessão.
      for (let attempt = 0; attempt < 20; attempt += 1) {
        const { data, error } = await supabase.auth.getSession();
        if (!active) return;

        if (error) {
          redirectWithError("Falha ao validar a sessão. Tente entrar novamente.");
          return;
        }
        if (data.session) {
          setMessage("Acesso confirmado. Redirecionando…");
          void navigate({ to: "/app", replace: true });
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      redirectWithError(
        "Sua sessão não pôde ser confirmada. Verifique se está usando uma conta institucional autorizada.",
      );
    }

    function redirectWithError(text: string) {
      if (!active) return;
      void navigate({ to: "/login", search: { error: text }, replace: true });
    }

    void resolveSession();

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-6"
      aria-live="polite"
      aria-busy="true"
    >
      <BrandMark className="h-24 w-auto" />
      <span
        aria-hidden="true"
        className="size-7 animate-spin rounded-full border-2 border-muted border-t-primary"
      />
      <p className="text-sm text-muted-foreground">{message}</p>
    </main>
  );
}
