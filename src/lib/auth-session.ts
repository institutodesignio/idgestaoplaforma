type LocalSignOut = (options: { scope: "local" }) => Promise<{ error: unknown | null }>;

/**
 * Encerra somente a sessão deste navegador.
 *
 * O Supabase usa `global` por padrão no JavaScript, o que também revogaria as
 * demais sessões do colaborador. O escopo local é obrigatório para permitir
 * troca segura de usuário em computadores compartilhados sem desconectar
 * outros dispositivos institucionais.
 */
export async function signOutCurrentSession(signOut: LocalSignOut): Promise<void> {
  const { error } = await signOut({ scope: "local" });
  if (error) throw error;
}
