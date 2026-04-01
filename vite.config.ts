import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
import fs from "node:fs";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        svgr(),
        {
            name: "generate-sitemap",
            closeBundle() {
                const siteUrl = process.env.VITE_SITE_URL;
                if (!siteUrl) return;
                const routes = ["/"];
                const xml = [
                    '<?xml version="1.0" encoding="UTF-8"?>',
                    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
                    ...routes.map((r) => `  <url><loc>${siteUrl}${r}</loc></url>`),
                    "</urlset>",
                ].join("\n");
                fs.writeFileSync("dist/sitemap.xml", xml);
            },
        },
    ],
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
