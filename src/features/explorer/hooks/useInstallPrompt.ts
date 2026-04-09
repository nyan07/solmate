import { useEffect, useState } from "react";
import { trackEvent } from "@/utils/analytics";

const STORAGE_KEY = "arkie_install_prompt_v1";
const SESSION_KEY = "arkie_install_prompt_counted";
const OPENS_UNTIL_REMINDER = 3;

export type InstallPlatform = "ios-safari" | "ios-other" | "android" | "desktop";

type StoredState =
    | { status: "added" }
    | { status: "dismissed"; opensSinceDismissal: number }
    | { status: "due" };

function isStandalone(): boolean {
    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as { standalone?: boolean }).standalone === true
    );
}

function detectPlatform(): InstallPlatform {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);

    if (!isIOS && !isAndroid) return "desktop";
    if (isIOS) {
        const isIOSBrowser = /CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);
        return isIOSBrowser ? "ios-other" : "ios-safari";
    }
    return "android";
}

function readState(): StoredState | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as StoredState) : null;
    } catch {
        return null;
    }
}

function writeState(state: StoredState): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // localStorage may be unavailable in private browsing on some browsers
    }
}

/**
 * Call once per app load (from App.tsx) to track how many times the user has
 * opened the app since last dismissing the prompt. When the threshold is reached,
 * transitions to "due" so the prompt shows on next mount — regardless of route.
 */
export function countInstallPromptOpen(): void {
    const state = readState();
    if (!state || state.status !== "dismissed") return;

    const alreadyCounted = sessionStorage.getItem(SESSION_KEY) === "1";
    if (alreadyCounted) return;

    sessionStorage.setItem(SESSION_KEY, "1");
    const newCount = state.opensSinceDismissal + 1;

    if (newCount >= OPENS_UNTIL_REMINDER) {
        writeState({ status: "due" });
    } else {
        writeState({ status: "dismissed", opensSinceDismissal: newCount });
    }
}

export function useInstallPrompt() {
    const [show, setShow] = useState(false);
    const platform = detectPlatform();

    useEffect(() => {
        if (isStandalone() || platform === "desktop") return;

        const state = readState();
        if (!state || state.status === "due") {
            setShow(true);
            trackEvent("install_prompt_shown", {
                platform,
                trigger: state?.status === "due" ? "reminder" : "first_time",
            });
        }
    }, []);

    function dismiss() {
        writeState({ status: "dismissed", opensSinceDismissal: 0 });
        sessionStorage.setItem(SESSION_KEY, "1");
        setShow(false);
        trackEvent("install_prompt_dismissed", { platform });
    }

    function confirmAdded() {
        writeState({ status: "added" });
        setShow(false);
        trackEvent("install_prompt_added", { platform });
    }

    return { show, platform, dismiss, confirmAdded };
}
