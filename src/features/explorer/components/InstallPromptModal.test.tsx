import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InstallPromptModal } from "./InstallPromptModal";
import { countInstallPromptOpen } from "@/features/explorer/hooks/useInstallPrompt";
import { UA, setUserAgent, setStandalone } from "@/testUtils/installPrompt";
import "@/i18n";

const STORAGE_KEY = "arkie_install_prompt_v1";
const SESSION_KEY = "arkie_install_prompt_counted";

beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    setStandalone(false);
});

describe("first visit", () => {
    it("shows iOS Safari instructions on first visit", () => {
        setUserAgent(UA.iosSafari);
        render(<InstallPromptModal />);
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(
            screen.getByText(
                "Tap the Share button (the square with an arrow) at the bottom of Safari."
            )
        ).toBeInTheDocument();
    });

    it("shows Android manual steps on first visit", () => {
        setUserAgent(UA.android);
        render(<InstallPromptModal />);
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(
            screen.getByText("Tap the menu button (⋮) in the top right of Chrome.")
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "I added it!" })).toBeInTheDocument();
    });

    it("shows open-in-Safari message for Chrome on iOS", () => {
        setUserAgent(UA.iosChrome);
        render(<InstallPromptModal />);
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText(/open this page in Safari/)).toBeInTheDocument();
    });

    it("does not show on desktop", () => {
        setUserAgent(UA.desktop);
        render(<InstallPromptModal />);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("does not show when already in standalone mode", () => {
        setUserAgent(UA.iosSafari);
        setStandalone(true);
        render(<InstallPromptModal />);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
});

describe("dismissing", () => {
    it("hides the modal when the close button is clicked", async () => {
        setUserAgent(UA.iosSafari);
        const user = userEvent.setup();
        render(<InstallPromptModal />);
        await user.click(screen.getByLabelText("Close"));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("hides the modal when the backdrop is clicked", async () => {
        setUserAgent(UA.android);
        const user = userEvent.setup();
        render(<InstallPromptModal />);
        await user.click(screen.getByTestId("install-prompt-backdrop"));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it('hides the modal when "Not now" is clicked', async () => {
        setUserAgent(UA.iosSafari);
        const user = userEvent.setup();
        render(<InstallPromptModal />);
        await user.click(screen.getByText("Not now"));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("does not show again before enough app opens have occurred", () => {
        setUserAgent(UA.iosSafari);
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ status: "dismissed", opensSinceDismissal: 0 })
        );
        render(<InstallPromptModal />);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("shows again when status is due", () => {
        setUserAgent(UA.iosSafari);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ status: "due" }));
        render(<InstallPromptModal />);
        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
});

describe("confirming installation", () => {
    it('hides the modal when "I added it!" is clicked', async () => {
        setUserAgent(UA.iosSafari);
        const user = userEvent.setup();
        render(<InstallPromptModal />);
        await user.click(screen.getByRole("button", { name: "I added it!" }));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("never shows again after confirming", () => {
        setUserAgent(UA.iosSafari);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ status: "added" }));
        render(<InstallPromptModal />);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("does not show the confirm button for Chrome on iOS", () => {
        setUserAgent(UA.iosChrome);
        render(<InstallPromptModal />);
        expect(screen.queryByRole("button", { name: "I added it!" })).not.toBeInTheDocument();
    });
});

describe("session counting", () => {
    it("increments the counter once per session", () => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ status: "dismissed", opensSinceDismissal: 0 })
        );

        countInstallPromptOpen();
        countInstallPromptOpen(); // second call in the same session should be a no-op

        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
        expect(stored.opensSinceDismissal).toBe(1);
    });

    it("transitions to 'due' when the threshold is reached", () => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ status: "dismissed", opensSinceDismissal: 2 })
        );

        countInstallPromptOpen();

        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
        expect(stored.status).toBe("due");
    });

    it("does not count if the session was already counted", () => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ status: "dismissed", opensSinceDismissal: 1 })
        );
        sessionStorage.setItem(SESSION_KEY, "1");

        countInstallPromptOpen();

        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
        expect(stored.opensSinceDismissal).toBe(1); // unchanged
    });

    it("does not show the modal before the threshold is reached", () => {
        setUserAgent(UA.iosSafari);
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ status: "dismissed", opensSinceDismissal: 1 })
        );
        sessionStorage.setItem(SESSION_KEY, "1");

        render(<InstallPromptModal />);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
});
