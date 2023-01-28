import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "main.js"),
      name: "@findr/pipeline",
      // the proper extensions will be added
      formats: ["es", "cjs"],
      fileName: (format, entryName) =>
        `@findr/pipeline/${entryName}.${format}.js`,
    },
    rollupOptions: {
      external: ["proskomma-json-tools"],
      output: {
        globals: {
          "proskomma-json-tools": "pk-json-tools",
        },
      },
    },
    sourcemap: true,
  },
});
