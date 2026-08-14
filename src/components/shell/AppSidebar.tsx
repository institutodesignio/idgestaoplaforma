import { Link, useRouterState } from "@tanstack/react-router";
import { BrandMark } from "@/components/branding/BrandMark";
import { useSession } from "@/contexts/SessionContext";
import { NAV_ITEMS, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function useVisibleNavItems(): NavItem[] {
  const { hasPermission, hasAnyPermission } = useSession();
  return NAV_ITEMS.filter((item) => {
    if (item.permission) return hasPermission(item.permission);
    if (item.anyPermission) return hasAnyPermission(item.anyPermission);
    return true;
  });
}

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const items = useVisibleNavItems();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <nav
      aria-label="Navegação institucional"
      className="bg-institutional flex h-full w-72 shrink-0 flex-col gap-8 px-5 py-7"
    >
      <Link to="/app" onClick={onNavigate} className="px-2">
        <BrandMark className="h-16 w-auto" onDark />
      </Link>

      <ul className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const active = item.to === "/app" ? pathname === "/app" : pathname.startsWith(item.to);
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-primary-foreground/50 focus-visible:outline-none",
                  active
                    ? "bg-primary-foreground/15 text-primary-foreground"
                    : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground",
                )}
              >
                <item.icon aria-hidden="true" className="size-4.5" />
                <span>{item.label}</span>
                {item.planned ? (
                  <span className="ml-auto rounded-full border border-primary-foreground/25 px-2 py-0.5 text-[10px] font-medium text-primary-foreground/60">
                    em planejamento
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="px-2 text-xs text-primary-foreground/45">
        Instituto Designio • Ambiente institucional
      </p>
    </nav>
  );
}
