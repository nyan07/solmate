import { render, screen } from "@testing-library/react";
import SwipeUp from "./SwipeUp";

vi.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
            <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
        ),
    },
    useAnimation: () => ({ start: vi.fn(), set: vi.fn() }),
}));

describe("<SwipeUp />", () => {
    it("renders children", () => {
        render(<SwipeUp>Panel content</SwipeUp>);
        expect(screen.getByText("Panel content")).toBeInTheDocument();
    });

    it("has role dialog", () => {
        render(<SwipeUp>Content</SwipeUp>);
        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("has aria-modal set to true", () => {
        render(<SwipeUp>Content</SwipeUp>);
        expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    });

    it("calls onOpenChange when the open prop changes", () => {
        const onOpenChange = vi.fn();
        const { rerender } = render(
            <SwipeUp open={false} onOpenChange={onOpenChange}>
                Content
            </SwipeUp>
        );
        rerender(
            <SwipeUp open={true} onOpenChange={onOpenChange}>
                Content
            </SwipeUp>
        );
        expect(onOpenChange).toHaveBeenCalledWith(true);
    });
});
