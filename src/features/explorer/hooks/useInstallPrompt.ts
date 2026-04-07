import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/utils/analytics";

const STORAGE_KEY = "arkie_install_prompt_v1";
const SESSION_KEY = "arkie_install_prompt_counted";
const OPENS_UNTIL_REMINDER = 3;

export type InstallPlatform = "ios-safari" | "ios-other" | "android" | "desktop";

type StoredState = { status: "added" } | { status: "dismissed"; opensSinceDismissal: number };

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Captured at module evaluation time — before React renders — so we never miss
// the event even if it fires before the component mounts.
let earlyCapturedPrompt: BeforeInstallPromptEvent | null = null;

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    earlyCapturedPrompt = e as BeforeInstallPromptEvent;
});

window.addEventListener("appinstalled", () => {
    earlyCapturedPrompt = null;
});

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
    const [canNativePrompt, setCanNativePrompt] = useState(() => earlyCapturedPrompt !== null);
    const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(earlyCapturedPrompt);
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

    // Also listen for the event firing after mount (e.g. on subsequent visits
    // where Chrome defers the prompt until the user has more engagement).
    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            const prompt = e as BeforeInstallPromptEvent;
            earlyCapturedPrompt = prompt;
            deferredPrompt.current = prompt;
            setCanNativePrompt(true);
        };

        const installedHandler = () => {
            confirmAdded();
        };

        window.addEventListener("beforeinstallprompt", handler);
        window.addEventListener("appinstalled", installedHandler);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
            window.removeEventListener("appinstalled", installedHandler);
        };
    }, []);

    function dismiss() {
        const state = readState();
        if (!state) {
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

    async function nativePrompt() {
        const prompt = deferredPrompt.current;
        if (!prompt) return;

        deferredPrompt.current = null;
        earlyCapturedPrompt = null;
        setCanNativePrompt(false);

        await prompt.prompt();
        const { outcome } = await prompt.userChoice;

        if (outcome === "accepted") {
            confirmAdded();
        } else {
            dismiss();
        }
    }

    return { show, platform, canNativePrompt, dismiss, confirmAdded, nativePrompt };
}
