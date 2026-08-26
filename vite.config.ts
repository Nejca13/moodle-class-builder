import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: "jsdom",
    environmentOptions: {
      url: "http://localhost/",
    },
    setupFiles: ["./src/tests/setup.ts"],
    css: false,
  },
});
