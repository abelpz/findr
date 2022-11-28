import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  build: {
    lib: {
      entry: {
        fnr: path.resolve(__dirname, "src/index.ts"),
        multiline: path.resolve(__dirname, "src/multiline/index.ts"),
      },
      name: "Findr",
      formats: ["es", "cjs"],
      fileName: (format, entryName) => `@findr/text/${entryName}.${format}.js`,
    },
    rollupOptions: {
      external: ["xregexp"],
      output: {
        globals: {
          xregexp: "xre",
        },
      },
    },
    sourcemap: true,
  },
});
