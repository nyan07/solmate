import { render, screen, fireEvent } from "@testing-library/react";
import { Range } from "./Range";

describe("<Range />", () => {
    const defaultProps = { value: 50, min: 0, max: 100, onChange: vi.fn() };

    it("renders a range input", () => {
        render(<Range {...defaultProps} />);
        expect(screen.getByRole("slider")).toBeInTheDocument();
    });

    it("sets min, max, and value attributes", () => {
        render(<Range {...defaultProps} />);
        const slider = screen.getByRole("slider");
        expect(slider).toHaveAttribute("min", "0");
        expect(slider).toHaveAttribute("max", "100");
        expect(slider).toHaveAttribute("value", "50");
    });

    it("defaults step to 1", () => {
        render(<Range {...defaultProps} />);
        expect(screen.getByRole("slider")).toHaveAttribute("step", "1");
    });

    it("uses the provided step value", () => {
        render(<Range {...defaultProps} step={5} />);
        expect(screen.getByRole("slider")).toHaveAttribute("step", "5");
    });

    it("calls onChange with a number when value changes", () => {
        const onChange = vi.fn();
        render(<Range {...defaultProps} onChange={onChange} />);
        fireEvent.change(screen.getByRole("slider"), { target: { value: "75" } });
        expect(onChange).toHaveBeenCalledWith(75);
    });
});
