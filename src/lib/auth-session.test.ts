import { describe, expect, it, vi } from "vitest";
import { signOutCurrentSession } from "./auth-session";

describe("signOutCurrentSession", () => {
  it("encerra somente a sessão do navegador atual", async () => {
    const signOut = vi.fn().mockResolvedValue({ error: null });

    await signOutCurrentSession(signOut);

    expect(signOut).toHaveBeenCalledOnce();
    expect(signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("propaga a falha para que a interface não simule um logout concluído", async () => {
    const error = new Error("falha de logout");
    const signOut = vi.fn().mockResolvedValue({ error });

    await expect(signOutCurrentSession(signOut)).rejects.toBe(error);
  });
});
