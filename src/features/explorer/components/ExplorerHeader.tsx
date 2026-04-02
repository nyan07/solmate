import { forwardRef, useCallback, useRef, useState } from "react";
import { BsSunset, BsSunrise, BsSliders } from "react-icons/bs";
import { DatePicker } from "@/components/DatePicker";
import { Range } from "@/components/Range";
import { useSunTimes } from "@/features/explorer/hooks/useSunTimes";
import { ExplorerFilter } from "./ExplorerFilter";
import { useFilters } from "./MapContext";
import { useClickOutside } from "@/hooks/useClickOutside";

type Props = {
    visible: boolean;
    date: Date;
    onDateChange: (date: Date) => void;
    hour: number;
    onHourChange: (hour: number) => void;
    sunTimes: ReturnType<typeof useSunTimes>;
};

const ExplorerHeader = forwardRef<HTMLDivElement, Props>(
    ({ visible, date, onDateChange, hour, onHourChange, sunTimes }, ref) => {
        const [filterOpen, setFilterOpen] = useState(false);
        const filterRef = useRef<HTMLDivElement>(null);
        useClickOutside(
            filterRef,
            useCallback(() => setFilterOpen(false), []),
            filterOpen
        );
        const { filters } = useFilters();
        const activeCount = Number(filters.openOnly) + Number(filters.outdoorSeatingOnly);

        return (
            <div
                ref={ref}
                className={`absolute top-0 left-0 right-0 z-50 transform transition-transform duration-500 ${visible ? "translate-y-0" : "-translate-y-full"}`}
            >
                <div className="p-4 pb-1 bg-white shadow-sm flex flex-col gap-4 items-center">
                    <div className="flex gap-4 items-start w-full">
                        <DatePicker value={date} onChange={onDateChange} />
                        <BsSunrise className="text-primary w-4 h-4 shrink-0" />
                        <div className="flex flex-col items-center flex-1 gap-1.5 mt-2">
                            <Range
                                min={sunTimes.sunrise}
                                max={sunTimes.sunset}
                                step={0.5}
                                value={hour}
                                onChange={onHourChange}
                            />
                            <span className="text-xs text-primary">
                                {String(Math.floor(hour)).padStart(2, "0")}:
                                {hour % 1 === 0 ? "00" : "30"}
                            </span>
                        </div>
                        <BsSunset className="text-primary w-4 h-4 shrink-0" />
                        <div className="relative" ref={filterRef}>
                            <button
                                onClick={() => setFilterOpen((o) => !o)}
                                className="text-primary hover:bg-primary-100 rounded-full transition-colors"
                            >
                                <BsSliders className="w-4 h-4" />
                                {activeCount > 0 && (
                                    <span className="absolute -top-2 -right-2 w-3.5 h-3.5 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center leading-none">
                                        {activeCount}
                                    </span>
                                )}
                            </button>
                            {filterOpen && <ExplorerFilter />}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

ExplorerHeader.displayName = "ExplorerHeader";

export default ExplorerHeader;
