import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss(), svgr()],
    define: {
        CESIUM_BASE_URL: JSON.stringify("/Cesium"),
    },
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./src/test/setup.ts"],
    },
    server: {
        port: 5173,
        proxy: {
            "/api": "http://localhost:3000",
        },
    },
});
