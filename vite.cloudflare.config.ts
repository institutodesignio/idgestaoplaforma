import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Build SPA independente para o Cloudflare Pages. A configuração do Firebase
// permanece disponível até a migração ser validada e o rollback deixar de ser
// necessário.
export default defineConfig({
  plugins: [
    tanstackStart({
      spa: {
        enabled: true,
      },
      server: {
        entry: "server",
      },
    }),
    tsConfigPaths(),
    tailwindcss(),
    react(),
  ],
  preview: {
    host: "127.0.0.1",
  },
});
