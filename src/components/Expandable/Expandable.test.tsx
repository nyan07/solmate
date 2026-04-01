import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Expandable } from "./Expandable";

describe("<Expandable />", () => {
    const defaultProps = {
        icon: <span data-testid="icon">★</span>,
        title: "Section Title",
        children: <p>Hidden content</p>,
    };

    it("renders the title", () => {
        render(<Expandable {...defaultProps} />);
        expect(screen.getByText("Section Title")).toBeInTheDocument();
    });

    it("renders the icon", () => {
        render(<Expandable {...defaultProps} />);
        expect(screen.getByTestId("icon")).toBeInTheDocument();
    });

    it("hides children by default", () => {
        render(<Expandable {...defaultProps} />);
        expect(screen.queryByText("Hidden content")).not.toBeInTheDocument();
    });

    it("shows children after clicking the toggle button", async () => {
        const user = userEvent.setup();
        render(<Expandable {...defaultProps} />);
        await user.click(screen.getByRole("button"));
        expect(screen.getByText("Hidden content")).toBeInTheDocument();
    });

    it("hides children again after a second click", async () => {
        const user = userEvent.setup();
        render(<Expandable {...defaultProps} />);
        await user.click(screen.getByRole("button"));
        await user.click(screen.getByRole("button"));
        expect(screen.queryByText("Hidden content")).not.toBeInTheDocument();
    });

    it("applies standalone position classes by default", () => {
        render(<Expandable {...defaultProps} />);
        expect(screen.getByRole("button")).toHaveClass("rounded-md");
    });

    it("applies first position classes", () => {
        render(<Expandable {...defaultProps} position="first" />);
        expect(screen.getByRole("button")).toHaveClass("rounded-t-md");
    });
});
