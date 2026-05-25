import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(import.meta.dirname, "src/index.ts"),
      name: "SendmuxFeedback",
      formats: ["es", "iife"],
      fileName: (format) => (format === "es" ? "sendmux-feedback.js" : "sendmux-feedback.iife.js")
    }
  }
});
