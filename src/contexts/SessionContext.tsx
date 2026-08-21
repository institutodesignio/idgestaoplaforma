import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError, type ApiFailureKind } from "@/lib/api";
import { fetchInstitutionalContext, type InstitutionalContext } from "@/lib/institutional";
import { supabase } from "@/lib/supabase";


export type SessionStatus =
  "loading" | "unauthenticated" | "expired" | "no_context" | "error" | "ready";

export type SessionContextValue = {
  status: SessionStatus;
  session: Session | null;
  authUser: User | null;
  context: InstitutionalContext | null;
  /** Autorização centralizada — sempre baseada no que /api/v1/me devolveu. */
  hasPermission: (code: string) => boolean;
  hasAnyPermission: (codes: string[]) => boolean;
  /** Alias curto de hasPermission, usado nos módulos. */
  can: (code: string) => boolean;
  hasRole: (code: string) => boolean;
  hasScope: (code: string) => boolean;
  reload: () => void;
  signOut: () => Promise<void>;
};

const SessionCtx = createContext<SessionContextValue | null>(null);

const FAILURE_TO_STATUS: Partial<Record<ApiFailureKind, SessionStatus>> = {
  unauthenticated: "unauthenticated",
  expired: "expired",
  no_context: "no_context",
  forbidden: "no_context",
  not_found: "no_context",
  temporary: "error",
};

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionResolved, setSessionResolved] = useState(false);
  const [context, setContext] = useState<InstitutionalContext | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [reloadKey, setReloadKey] = useState(0);

  /**
   * Descarta qualquer dado institucional em cache. Obrigatório ao encerrar ou
   * trocar de sessão: as consultas contêm dados sensíveis e não podem ser
   * reaproveitadas por outra identidade no mesmo navegador.
   */
  const purgeCache = useCallback(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
  }, [queryClient]);

  // 1) Sessão: exclusivamente pelo SDK oficial do Supabase.
  useEffect(() => {
    let active = true;
    let currentUserId: string | null | undefined;

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (!active) return;
      const nextUserId = next?.user?.id ?? null;
      const identityChanged =
        currentUserId !== undefined && currentUserId !== nextUserId;
      if (event === "SIGNED_OUT" || identityChanged) {
        setContext(null);
        void purgeCache();
      }
      currentUserId = nextUserId;
      setSession(next);
      setSessionResolved(true);
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      currentUserId = data.session?.user?.id ?? null;
      setSession(data.session);
      setSessionResolved(true);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [purgeCache]);


  // 2) Contexto institucional via GET /api/v1/me com Bearer <access_token>.
  useEffect(() => {
    if (!sessionResolved) return;

    if (!session) {
      setContext(null);
      setStatus("unauthenticated");
      return;
    }

    let active = true;
    setStatus("loading");

    void (async () => {
      try {
        const next = await fetchInstitutionalContext();
        if (!active) return;
        setContext(next);
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setContext(null);
        setStatus(error instanceof ApiError ? (FAILURE_TO_STATUS[error.kind] ?? "error") : "error");
      }
    })();

    return () => {
      active = false;
    };
  }, [session, sessionResolved, reloadKey]);

  const permissions = useMemo(() => new Set(context?.permissions ?? []), [context]);
  const roles = useMemo(() => new Set(context?.roles ?? []), [context]);
  const scopes = useMemo(() => new Set(context?.scopes ?? []), [context]);

  const hasPermission = useCallback(
    (code: string) => status === "ready" && permissions.has(code),
    [permissions, status],
  );
  const hasAnyPermission = useCallback(
    (codes: string[]) => codes.some((code) => hasPermission(code)),
    [hasPermission],
  );
  const hasRole = useCallback(
    (code: string) => status === "ready" && roles.has(code),
    [roles, status],
  );
  const hasScope = useCallback(
    (code: string) => status === "ready" && scopes.has(code),
    [scopes, status],
  );

  const signOut = useCallback(async () => {
    // Ordem obrigatória: cancelar + limpar cache sensível antes de encerrar a sessão.
    await purgeCache();
    await supabase.auth.signOut();
    setContext(null);
  }, [purgeCache]);


  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      session,
      authUser: session?.user ?? null,
      context,
      hasPermission,
      hasAnyPermission,
      can: hasPermission,
      hasRole,
      hasScope,
      reload: () => setReloadKey((key) => key + 1),
      signOut,
    }),
    [status, session, context, hasPermission, hasAnyPermission, hasRole, hasScope, signOut],
  );

  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>;
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionCtx);
  if (!value) throw new Error("useSession precisa estar dentro de <SessionProvider>.");
  return value;
}

/** Helper centralizado de autorização. */
export function usePermission(code: string): boolean {
  return useSession().hasPermission(code);
}
