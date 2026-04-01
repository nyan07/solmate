import { render, screen } from "@testing-library/react";
import StickyHeader from "./StickyHeader";

describe("<StickyHeader />", () => {
    it("renders the title when provided", () => {
        render(<StickyHeader title="Page Title" />);
        expect(screen.getByText("Page Title")).toBeInTheDocument();
    });

    it("renders actions when provided", () => {
        render(<StickyHeader actions={<button>Save</button>} />);
        expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    });

    it("does not render title wrapper when title is omitted", () => {
        const { container } = render(<StickyHeader actions={<button>Save</button>} />);
        // Only the actions div should be present, no flex-1 title wrapper
        const innerDiv = container.firstElementChild!.firstElementChild!;
        expect(innerDiv.children).toHaveLength(1);
    });

    it("does not render actions wrapper when actions are omitted", () => {
        const { container } = render(<StickyHeader title="Title" />);
        const innerDiv = container.firstElementChild!.firstElementChild!;
        expect(innerDiv.children).toHaveLength(1);
    });

    it("applies bg-primary-100 class for the default variant", () => {
        const { container } = render(<StickyHeader title="Title" />);
        const innerDiv = container.firstElementChild!.firstElementChild!;
        expect(innerDiv).toHaveClass("bg-primary-100");
    });

    it("does not apply bg-primary-100 for the transparent variant", () => {
        const { container } = render(<StickyHeader title="Title" variant="transparent" />);
        const innerDiv = container.firstElementChild!.firstElementChild!;
        expect(innerDiv).not.toHaveClass("bg-primary-100");
    });

    it("adds shadow class when scrolled is true", () => {
        const { container } = render(<StickyHeader title="Title" scrolled={true} />);
        const innerDiv = container.firstElementChild!.firstElementChild!;
        expect(innerDiv).toHaveClass("shadow");
    });
});
