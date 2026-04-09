import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import posthog from "posthog-js";
import "./i18n";

if (import.meta.env.VITE_POSTHOG_TOKEN) {
    posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_TOKEN, {
        api_host: import.meta.env.VITE_PUBLIC_POSTHOG_TOKEN ?? "https://eu.i.posthog.com",
        person_profiles: "identified_only",
        autocapture: false,
        capture_pageview: false,
    });
}

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </QueryClientProvider>
        <Analytics />
        <SpeedInsights />
    </StrictMode>
);
