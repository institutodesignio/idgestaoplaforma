import { LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSession } from "@/contexts/SessionContext";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function useInstitutionalIdentity() {
  const { context, authUser } = useSession();
  const user = context?.user ?? null;

  const name =
    (typeof user?.['full_name'] === "string" ? (user['full_name'] as string) : undefined) ??
    (typeof user?.['name'] === "string" ? (user['name'] as string) : undefined) ??
    (authUser?.user_metadata?.['full_name'] as string | undefined) ??
    (authUser?.user_metadata?.['name'] as string | undefined) ??
    authUser?.email ??
    "Colaborador";

  const email =
    (typeof user?.['email'] === "string" ? (user['email'] as string) : undefined) ??
    authUser?.email ??
    "";

  const membershipRole =
    (typeof context?.membership?.['role'] === "string"
      ? (context.membership['role'] as string)
      : undefined) ??
    (typeof context?.membership?.['role_name'] === "string"
      ? (context.membership['role_name'] as string)
      : undefined);

  const role = membershipRole ?? context?.roles[0] ?? "Sem papel definido";
  const organization =
    (typeof context?.organization?.['name'] === "string"
      ? (context.organization['name'] as string)
      : undefined) ?? "Instituto Designio";

  const avatar =
    (typeof user?.['avatar_url'] === "string" ? (user['avatar_url'] as string) : undefined) ??
    (authUser?.user_metadata?.['avatar_url'] as string | undefined) ??
    (authUser?.user_metadata?.['picture'] as string | undefined);

  return { name, email, role, organization, avatar };
}

export function AppHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
  const navigate = useNavigate();
  const { signOut } = useSession();
  const { name, role, organization, avatar } = useInstitutionalIdentity();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    void navigate({ to: "/login", search: { error: undefined }, replace: true });
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Abrir menu de navegação"
            className="rounded-lg border border-border p-2 text-foreground transition-colors hover:bg-secondary lg:hidden"
          >
            <Menu aria-hidden="true" className="size-4" />
          </button>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {organization}
            </p>
            <p className="truncate text-sm font-semibold text-foreground">ID Gestão</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden min-w-0 text-right sm:block">
            <p className="truncate text-sm font-semibold text-foreground">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{role}</p>
          </div>
          {avatar ? (
            <img
              src={avatar}
              alt={`Foto de perfil de ${name}`}
              referrerPolicy="no-referrer"
              className="size-10 rounded-full border border-border object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground"
            >
              {initials(name)}
            </div>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            aria-busy={signingOut ? "true" : "false"}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          >
            <LogOut aria-hidden="true" className="size-4" />
            <span className="hidden sm:inline">{signingOut ? "Saindo…" : "Sair"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
