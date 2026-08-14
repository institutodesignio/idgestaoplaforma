export function ModulePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section>
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
        Módulo
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
          Em planejamento
        </span>
      </div>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p>

      <div className="surface-card mt-8 rounded-2xl p-8">
        <p className="text-sm text-muted-foreground">
          Este módulo ainda não possui endpoint oficial no backend institucional. Nenhum dado é
          exibido aqui até que a integração real esteja disponível.
        </p>
      </div>
    </section>
  );
}
