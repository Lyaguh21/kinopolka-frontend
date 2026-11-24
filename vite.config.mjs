import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000",
        rewrite: (path) => path.slice(4),
      },
    },
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        if (
          warning.code === "MODULE_LEVEL_DIRECTIVE" &&
          warning.id?.includes("/node_modules/") &&
          warning.message.includes('"use client"')
        )
          return;
        warn(warning);
      },
      output: {
        manualChunks: {
          framework: ["react", "react-dom", "react-router"],
          ui: ["@mantine/core", "@mantine/hooks"],
          motion: ["motion/react"],
          charts: ["@mantine/charts", "recharts"],
        },
      },
    },
  },
});
