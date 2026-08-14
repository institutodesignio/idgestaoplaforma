import { BrandMark } from "@/components/branding/BrandMark";

export function FullScreenLoader({
  label = "Carregando contexto institucional…",
}: {
  label?: string;
}) {
  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-6"
      aria-busy="true"
      aria-live="polite"
    >
      <BrandMark className="h-20 w-auto" />
      <span
        aria-hidden="true"
        className="size-7 animate-spin rounded-full border-2 border-muted border-t-primary"
      />
      <p className="text-sm text-muted-foreground">{label}</p>
    </main>
  );
}

export function StateMessage({
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6 py-12">
      <div className="surface-card w-full max-w-md rounded-2xl p-8 text-center">
        <BrandMark className="mx-auto h-16 w-auto" />
        <h1 className="mt-6 text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          {actionLabel && onAction ? (
            <button
              type="button"
              onClick={onAction}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
            >
              {actionLabel}
            </button>
          ) : null}
          {secondaryLabel && onSecondary ? (
            <button
              type="button"
              onClick={onSecondary}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
            >
              {secondaryLabel}
            </button>
          ) : null}
        </div>
      </div>
    </main>
  );
}
