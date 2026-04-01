import { render, screen } from "@testing-library/react";
import { Tag } from "./Tag";
import type { TagTone } from "./types";

describe("<Tag />", () => {
    it("renders the tag name lowercase", () => {
        render(<Tag name="TypeScript" />);
        expect(screen.getByText("typescript")).toBeInTheDocument();
    });

    const TONES: [TagTone, string][] = [
        ["neutral", "primary"],
        ["success", "success"],
        ["danger", "danger"],
        ["warning", "warning"],
        ["info", "info"],
    ];

    describe("filled variant", () => {
        it.each(TONES)("tone=%s applies correct classes", (tone, color) => {
            render(<Tag name="test" tone={tone} variant="filled" />);
            expect(screen.getByText("test")).toHaveClass(
                `bg-${color}`,
                "text-white",
                `border-${color}`
            );
        });
    });

    describe("outline variant", () => {
        it.each(TONES)("tone=%s applies correct classes", (tone, color) => {
            render(<Tag name="test" tone={tone} variant="outline" />);
            expect(screen.getByText("test")).toHaveClass(
                "bg-transparent",
                `text-${color}`,
                `border-${color}`
            );
        });
    });
});
