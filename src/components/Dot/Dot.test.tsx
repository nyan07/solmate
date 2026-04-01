import { render, screen } from "@testing-library/react";
import { Dot } from "./Dot";

describe("<Dot />", () => {
    it("renders the separator character", () => {
        render(<Dot />);
        expect(screen.getByText("·")).toBeInTheDocument();
    });

    it("has aria-hidden to hide it from assistive technology", () => {
        render(<Dot />);
        expect(screen.getByText("·")).toHaveAttribute("aria-hidden", "true");
    });
});
