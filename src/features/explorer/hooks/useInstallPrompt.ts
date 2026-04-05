import { useEffect, useState } from "react";
import { trackEvent } from "@/utils/analytics";

const STORAGE_KEY = "arkie_install_prompt_v1";
const SESSION_KEY = "arkie_install_prompt_counted";
const OPENS_UNTIL_REMINDER = 3;

export type InstallPlatform = "ios-safari" | "ios-other" | "android" | "desktop";

type StoredState = { status: "added" } | { status: "dismissed"; opensSinceDismissal: number };

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

export function useInstallPrompt() {
    const [show, setShow] = useState(false);
    const platform = detectPlatform();

    useEffect(() => {
        if (isStandalone() || platform === "desktop") return;

        const state = readState();

        if (!state) {
            // First ever visit
            trackEvent("install_prompt_shown", { platform, trigger: "first_visit" });
            setShow(true);
            return;
        }

        if (state.status === "added") return;

        if (state.status === "dismissed") {
            // Count once per browser session to track "app opens"
            const alreadyCounted = sessionStorage.getItem(SESSION_KEY) === "1";
            const newCount = state.opensSinceDismissal + (alreadyCounted ? 0 : 1);

            if (!alreadyCounted) {
                sessionStorage.setItem(SESSION_KEY, "1");
                writeState({ status: "dismissed", opensSinceDismissal: newCount });
            }

            if (newCount >= OPENS_UNTIL_REMINDER) {
                writeState({ status: "dismissed", opensSinceDismissal: 0 });
                trackEvent("install_prompt_shown", { platform, trigger: "reminder" });
                setShow(true);
            }
        }
    }, []);

    function dismiss() {
        const state = readState();
        if (!state) {
            // First dismissal — start counting from 0, mark this session as counted
            writeState({ status: "dismissed", opensSinceDismissal: 0 });
            sessionStorage.setItem(SESSION_KEY, "1");
        }
        trackEvent("install_prompt_dismissed", { platform });
        setShow(false);
    }

    function confirmAdded() {
        writeState({ status: "added" });
        trackEvent("install_prompt_added", { platform });
        setShow(false);
    }

    return { show, platform, dismiss, confirmAdded };
}
