import { render, screen } from "@testing-library/react";
import { Tag } from "./Tag";
import type { TagTone } from "./types";

describe("<Tag />", () => {
    it("renders the tag name lowercase", () => {
        render(<Tag name="TypeScript" />);
        expect(screen.getByText("typescript")).toBeInTheDocument();
    });

    // neutral uses different color tokens per variant so it's tested explicitly
    const CHROMATIC_TONES: [TagTone, string][] = [
        ["success", "success"],
        ["danger", "danger"],
        ["warning", "warning"],
        ["info", "info"],
    ];

    describe("filled variant", () => {
        it("neutral tone applies correct classes", () => {
            render(<Tag name="test" tone="neutral" variant="filled" />);
            expect(screen.getByText("test")).toHaveClass("bg-neutral-400", "text-white");
        });

        it.each(CHROMATIC_TONES)("tone=%s applies correct classes", (tone, color) => {
            const classes = `bg-${color}-400 text-white border-0`;
            render(<Tag name="test" tone={tone} variant="filled" />);
            expect(screen.getByText("test")).toHaveClass(...classes.split(" "));
        });
    });

    describe("outline variant", () => {
        it("neutral tone applies correct classes", () => {
            render(<Tag name="test" tone="neutral" variant="outline" />);
            expect(screen.getByText("test")).toHaveClass(
                "bg-transparent",
                "text-primary-500",
                "border-primary-500"
            );
        });

        it.each(CHROMATIC_TONES)("tone=%s applies correct classes", (tone, color) => {
            const classes = `bg-transparent text-${color}-500 border-${color}-500`;
            render(<Tag name="test" tone={tone} variant="outline" />);
            expect(screen.getByText("test")).toHaveClass(...classes.split(" "));
        });
    });
});
