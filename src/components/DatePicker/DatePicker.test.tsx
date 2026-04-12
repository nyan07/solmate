import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DatePicker } from "./DatePicker";
import "@/i18n";

vi.mock("react-day-picker", () => ({
    DayPicker: ({ onSelect }: { onSelect: (date: Date) => void }) => (
        <button data-testid="day-picker" onClick={() => onSelect(new Date("2024-06-15"))}>
            Select Date
        </button>
    ),
}));

describe("<DatePicker />", () => {
    const defaultDate = new Date("2024-01-01");

    it("renders the calendar toggle button", () => {
        render(<DatePicker value={defaultDate} onChange={vi.fn()} />);
        expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("hides the calendar picker initially", () => {
        render(<DatePicker value={defaultDate} onChange={vi.fn()} />);
        expect(screen.queryByTestId("day-picker")).not.toBeInTheDocument();
    });

    it("shows the calendar picker when button is clicked", async () => {
        const user = userEvent.setup();
        render(<DatePicker value={defaultDate} onChange={vi.fn()} />);
        await user.click(screen.getByRole("button"));
        expect(screen.getByTestId("day-picker")).toBeInTheDocument();
    });

    it("hides the calendar picker on second click", async () => {
        const user = userEvent.setup();
        render(<DatePicker value={defaultDate} onChange={vi.fn()} />);
        await user.click(screen.getByRole("button"));
        // after opening, two buttons exist — click the toggle (first) to close
        await user.click(screen.getAllByRole("button")[0]);
        expect(screen.queryByTestId("day-picker")).not.toBeInTheDocument();
    });

    it("calls onChange with the selected date", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<DatePicker value={defaultDate} onChange={onChange} />);
        await user.click(screen.getByRole("button"));
        await user.click(screen.getByTestId("day-picker"));
        expect(onChange).toHaveBeenCalledWith(new Date("2024-06-15"));
    });

    it("closes the calendar after a date is selected", async () => {
        const user = userEvent.setup();
        render(<DatePicker value={defaultDate} onChange={vi.fn()} />);
        await user.click(screen.getByRole("button"));
        await user.click(screen.getByTestId("day-picker"));
        expect(screen.queryByTestId("day-picker")).not.toBeInTheDocument();
    });
});

describe("date label", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2024-06-12")); // Wednesday
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("shows Today when value is today", () => {
        render(<DatePicker value={new Date("2024-06-12")} onChange={vi.fn()} />);
        expect(screen.getByRole("button")).toHaveTextContent("Today");
    });

    it("shows month and day when value is more than 7 days away", () => {
        render(<DatePicker value={new Date("2024-06-22")} onChange={vi.fn()} />); // 10 days out
        expect(screen.getByRole("button")).toHaveTextContent("06/22");
    });
});
