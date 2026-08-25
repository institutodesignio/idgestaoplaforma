import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Independent Firebase build. The Lovable configuration remains unchanged so
// the connected editor can continue using its Cloudflare SSR target.
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
