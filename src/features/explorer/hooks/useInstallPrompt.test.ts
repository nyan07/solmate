import { renderHook, act } from "@testing-library/react";
import { useInstallPrompt } from "./useInstallPrompt";
import { UA, setUserAgent, setStandalone } from "@/testUtils/installPrompt";

const STORAGE_KEY = "arkie_install_prompt_v1";
const SESSION_KEY = "arkie_install_prompt_counted";

beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    setStandalone(false);
});

describe("useInstallPrompt — visibility", () => {
    it("shows on first visit for iOS Safari", () => {
        setUserAgent(UA.iosSafari);
        const { result } = renderHook(() => useInstallPrompt());
        expect(result.current.show).toBe(true);
    });

    it("shows on first visit for Android", () => {
        setUserAgent(UA.android);
        const { result } = renderHook(() => useInstallPrompt());
        expect(result.current.show).toBe(true);
    });

    it("shows on first visit for iOS Chrome (ios-other)", () => {
        setUserAgent(UA.iosChrome);
        const { result } = renderHook(() => useInstallPrompt());
        expect(result.current.show).toBe(true);
    });

    it("never shows on desktop", () => {
        setUserAgent(UA.desktop);
        const { result } = renderHook(() => useInstallPrompt());
        expect(result.current.show).toBe(false);
    });

    it("never shows when already in standalone mode (matchMedia)", () => {
        setUserAgent(UA.android);
        setStandalone(true);
        const { result } = renderHook(() => useInstallPrompt());
        expect(result.current.show).toBe(false);
    });

    it("never shows when already in standalone mode (navigator.standalone)", () => {
        setUserAgent(UA.iosSafari);
        setStandalone(true);
        const { result } = renderHook(() => useInstallPrompt());
        expect(result.current.show).toBe(false);
    });

    it("does not show after dismissal with fewer opens than the threshold", () => {
        setUserAgent(UA.iosSafari);
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ status: "dismissed", opensSinceDismissal: 0 })
        );
        const { result } = renderHook(() => useInstallPrompt());
        expect(result.current.show).toBe(false);
    });

    it("shows again once the open count reaches the threshold", () => {
        setUserAgent(UA.iosSafari);
        // Seed one below the threshold so this render pushes it over
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ status: "dismissed", opensSinceDismissal: 2 })
        );
        const { result } = renderHook(() => useInstallPrompt());
        expect(result.current.show).toBe(true);
    });

    it("never shows after user confirmed they added it", () => {
        setUserAgent(UA.iosSafari);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ status: "added" }));
        const { result } = renderHook(() => useInstallPrompt());
        expect(result.current.show).toBe(false);
    });
});

describe("useInstallPrompt — dismiss()", () => {
    it("hides the modal", () => {
        setUserAgent(UA.iosSafari);
        const { result } = renderHook(() => useInstallPrompt());
        expect(result.current.show).toBe(true);

        act(() => result.current.dismiss());

        expect(result.current.show).toBe(false);
    });

    it("saves dismissed state to localStorage on first dismissal", () => {
        setUserAgent(UA.iosSafari);
        const { result } = renderHook(() => useInstallPrompt());

        act(() => result.current.dismiss());

        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
        expect(stored.status).toBe("dismissed");
        expect(stored.opensSinceDismissal).toBe(0);
    });

    it("marks this session as counted on first dismissal", () => {
        setUserAgent(UA.iosSafari);
        const { result } = renderHook(() => useInstallPrompt());

        act(() => result.current.dismiss());

        expect(sessionStorage.getItem(SESSION_KEY)).toBe("1");
    });
});

describe("useInstallPrompt — confirmAdded()", () => {
    it("hides the modal", () => {
        setUserAgent(UA.iosSafari);
        const { result } = renderHook(() => useInstallPrompt());

        act(() => result.current.confirmAdded());

        expect(result.current.show).toBe(false);
    });

    it("saves added state to localStorage", () => {
        setUserAgent(UA.iosSafari);
        const { result } = renderHook(() => useInstallPrompt());

        act(() => result.current.confirmAdded());

        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
        expect(stored.status).toBe("added");
    });
});

describe("useInstallPrompt — open counter", () => {
    it("increments opensSinceDismissal on each new session", () => {
        setUserAgent(UA.iosSafari);
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ status: "dismissed", opensSinceDismissal: 0 })
        );

        renderHook(() => useInstallPrompt());

        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
        expect(stored.opensSinceDismissal).toBe(1);
    });

    it("does not double-count if the hook remounts in the same session", () => {
        setUserAgent(UA.iosSafari);
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ status: "dismissed", opensSinceDismissal: 0 })
        );
        sessionStorage.setItem(SESSION_KEY, "1");

        renderHook(() => useInstallPrompt());

        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
        expect(stored.opensSinceDismissal).toBe(0);
    });

    it("resets counter to 0 after showing the reminder", () => {
        setUserAgent(UA.iosSafari);
        // Seed one below threshold so this render triggers the show and reset
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ status: "dismissed", opensSinceDismissal: 2 })
        );

        renderHook(() => useInstallPrompt());

        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
        expect(stored.opensSinceDismissal).toBe(0);
    });
});

describe("useInstallPrompt — platform detection", () => {
    it("detects ios-safari", () => {
        setUserAgent(UA.iosSafari);
        const { result } = renderHook(() => useInstallPrompt());
        expect(result.current.platform).toBe("ios-safari");
    });

    it("detects ios-other for Chrome on iOS", () => {
        setUserAgent(UA.iosChrome);
        const { result } = renderHook(() => useInstallPrompt());
        expect(result.current.platform).toBe("ios-other");
    });

    it("detects android", () => {
        setUserAgent(UA.android);
        const { result } = renderHook(() => useInstallPrompt());
        expect(result.current.platform).toBe("android");
    });

    it("detects desktop", () => {
        setUserAgent(UA.desktop);
        const { result } = renderHook(() => useInstallPrompt());
        expect(result.current.platform).toBe("desktop");
    });
});
