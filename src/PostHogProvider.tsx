import { type ReactNode } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "@posthog/react";

export function PostHogProvider({ children }: { children: ReactNode }) {
    return <PHProvider client={posthog}>{children}</PHProvider>;
}
