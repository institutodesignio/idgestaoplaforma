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
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p>

      <div className="surface-card mt-8 rounded-2xl p-8">
        <p className="text-sm text-muted-foreground">
          Estrutura criada. As funcionalidades deste módulo serão implementadas nas próximas
          etapas, consumindo o backend institucional.
        </p>
      </div>
    </section>
  );
}
