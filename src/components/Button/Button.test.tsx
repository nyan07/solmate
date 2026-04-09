import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "./Button";

describe("<Button />", () => {
    it("renders as a button element by default", () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
    });

    it("renders as an anchor element when href is provided", () => {
        render(<Button href="/path">Go</Button>);
        const link = screen.getByRole("link", { name: "Go" });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute("href", "/path");
    });

    it("applies filled variant classes by default", () => {
        render(<Button>Filled</Button>);
        expect(screen.getByRole("button")).toHaveClass("bg-primary");
    });

    it("applies outline variant classes", () => {
        render(<Button variant="outline">Outline</Button>);
        expect(screen.getByRole("button")).toHaveClass("border-primary");
    });

    it("merges custom className", () => {
        render(<Button className="extra-class">X</Button>);
        expect(screen.getByRole("button")).toHaveClass("extra-class");
    });

    it("calls onClick when clicked", async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();
        render(<Button onClick={onClick}>Click</Button>);
        await user.click(screen.getByRole("button"));
        expect(onClick).toHaveBeenCalledOnce();
    });

    it("is disabled when disabled prop is set", () => {
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByRole("button")).toBeDisabled();
    });

    it("passes anchor attributes through when rendered as link", () => {
        render(
            <Button href="/dest" target="_blank" rel="noopener noreferrer">
                Link
            </Button>
        );
        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("defaults to type=button to prevent accidental form submission", () => {
        render(<Button>Submit</Button>);
        expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    });

    it("allows overriding type to submit", () => {
        render(<Button type="submit">Submit</Button>);
        expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
    });

    it("sets aria-label on icon-only button", () => {
        render(<Button label="Filter" />);
        expect(screen.getByRole("button", { name: "Filter" })).toBeInTheDocument();
    });

    it("does not set aria-label when children are present", () => {
        render(<Button label="ignored">Text</Button>);
        expect(screen.getByRole("button")).not.toHaveAttribute("aria-label");
    });

    it("sets aria-pressed when selected is true", () => {
        render(<Button selected>Toggle</Button>);
        expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
    });

    it("sets aria-pressed=false when selected is false", () => {
        render(<Button selected={false}>Toggle</Button>);
        expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
    });

    it("omits aria-pressed when selected is not provided", () => {
        render(<Button>Toggle</Button>);
        expect(screen.getByRole("button")).not.toHaveAttribute("aria-pressed");
    });

    it("applies selected visual style when selected is true", () => {
        render(
            <Button variant="ghost" selected>
                Filter
            </Button>
        );
        expect(screen.getByRole("button")).toHaveClass("bg-primary-100");
    });

    it("does not set aria-pressed on anchor variant", () => {
        render(
            <Button href="/path" selected>
                Link
            </Button>
        );
        expect(screen.getByRole("link")).not.toHaveAttribute("aria-pressed");
    });
});
