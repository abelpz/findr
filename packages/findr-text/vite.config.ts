import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "findr",
      fileName: (format) => `@findr/text.${format}.js`,
    },
    sourcemap: true,
  },
});
