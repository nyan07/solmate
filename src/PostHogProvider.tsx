import { useEffect, type ReactNode } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "@posthog/react";

export function PostHogProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        if (import.meta.env.VITE_POSTHOG_TOKEN) {
            posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_TOKEN, {
                api_host: import.meta.env.VITE_PUBLIC_POSTHOG_TOKEN ?? "https://eu.i.posthog.com",
                person_profiles: "identified_only",
                defaults: "2026-01-30",
            });
        }
    }, []);

    return <PHProvider client={posthog}>{children}</PHProvider>;
}
