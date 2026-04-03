import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "e2e",
    // Each test gets a generous timeout — animations (200 ms) + page load
    timeout: 30_000,
    expect: { timeout: 5_000 },
    // No retries locally; 1 retry in CI to reduce flakiness from animation timing
    retries: process.env.CI ? 1 : 0,
    // Sequential is fine for a small e2e suite
    workers: 1,
    reporter: [["list"], ["html", { open: "never" }]],

    projects: [
        {
            // Primary target: iOS Safari behaviour via WebKit
            name: "webkit-iphone",
            use: { ...devices["iPhone 14"] },
        },
    ],

    webServer: {
        // Full stack (Edge Functions + Vite) — matches `npx vercel dev`
        command: "npx vercel dev --listen 3001",
        url: "http://localhost:3001",
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
    },

    use: {
        baseURL: "http://localhost:3001",
        // Capture trace on first retry for debugging
        trace: "on-first-retry",
        // Videos help diagnose animation bugs on iOS
        video: "on-first-retry",
    },
});
