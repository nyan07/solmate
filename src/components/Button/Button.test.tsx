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
});
