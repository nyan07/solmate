import { forwardRef } from "react";
import { BsSunset, BsSunrise } from "react-icons/bs";
import { DatePicker } from "@/components/DatePicker";
import { Range } from "@/components/Range";
import { useSunTimes } from "@/features/explorer/hooks/useSunTimes";
import { useLayout } from "@/features/explorer/state/mapStore";

type Props = {
    date: Date;
    onDateChange: (date: Date) => void;
    hour: number;
    onHourChange: (hour: number) => void;
    onHourChangeCommit?: (hour: number) => void;
    sunTimes: ReturnType<typeof useSunTimes>;
};

const ExplorerHeader = forwardRef<HTMLDivElement, Props>(
    ({ date, onDateChange, hour, onHourChange, onHourChangeCommit, sunTimes }, ref) => {
        const { swipeUpExpanded } = useLayout();
        return (
            <div ref={ref} className="absolute left-0 right-0 z-50">
                <div
                    className="p-2 bg-white shadow-sm flex flex-col gap-4 items-center"
                    style={{
                        borderBottomLeftRadius: swipeUpExpanded ? 0 : "0.75rem",
                        borderBottomRightRadius: swipeUpExpanded ? 0 : "0.75rem",
                        transition:
                            "border-bottom-left-radius 0.2s ease-out, border-bottom-right-radius 0.2s ease-out",
                    }}
                >
                    <div className="flex gap-4 items-center w-full">
                        <DatePicker value={date} onChange={onDateChange} />
                        <div className="flex gap-1 items-center flex-grow">
                            <BsSunrise className="text-primary w-4 h-4" />

                            <Range
                                min={sunTimes.sunrise}
                                max={sunTimes.sunset}
                                step={0.5}
                                value={hour}
                                onChange={onHourChange}
                                onChangeCommit={onHourChangeCommit}
                            />
                            <BsSunset className="text-primary w-4 h-4" />
                        </div>
                        <span className="text-sm text-primary w-10">
                            {String(Math.floor(hour)).padStart(2, "0")}:
                            {hour % 1 === 0 ? "00" : "30"}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
);

ExplorerHeader.displayName = "ExplorerHeader";

export default ExplorerHeader;
