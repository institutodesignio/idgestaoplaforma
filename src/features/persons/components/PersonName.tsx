import { usePerson } from "../queries";

/**
 * Exibe o nome de uma pessoa a partir do UUID devolvido pela API.
 * O backend de alguns módulos devolve apenas o identificador.
 */
export function PersonName({
  personId,
  fallback = "Pessoa não informada",
}: {
  personId: string | null | undefined;
  fallback?: string;
}) {
  const query = usePerson(personId ?? "", Boolean(personId));
  if (!personId) return <>{fallback}</>;
  if (query.isLoading) return <span className="text-muted-foreground">carregando…</span>;
  return <>{query.data?.person?.full_name ?? fallback}</>;
}
