import { forwardRef } from "react";
import { FiSunrise, FiSunset } from "react-icons/fi";
import { DatePicker } from "@/components/DatePicker";
import { Range } from "@/components/Range";
import { useSunTimes } from "@/features/explorer/hooks/useSunTimes";

type Props = {
    visible: boolean;
    date: Date;
    onDateChange: (date: Date) => void;
    hour: number;
    onHourChange: (hour: number) => void;
    sunTimes: ReturnType<typeof useSunTimes>;
};

const ExplorerHeader = forwardRef<HTMLDivElement, Props>(
    ({ visible, date, onDateChange, hour, onHourChange, sunTimes }, ref) => (
        <div
            ref={ref}
            className={`absolute top-0 left-0 right-0 z-50 transform transition-transform duration-500 ${visible ? "translate-y-0" : "-translate-y-full"}`}
        >
            <div className="p-4 bg-neutral-50 shadow-md rounded-b-xl flex flex-col gap-4 items-center">
                <div className="flex gap-4 items-start w-full">
                    <DatePicker value={date} onChange={onDateChange} />
                    <FiSunrise className="text-primary-800 mt-2" />
                    <div className="flex flex-col items-center flex-1 gap-1 mt-4">
                        <Range
                            min={sunTimes.sunrise}
                            max={sunTimes.sunset}
                            step={0.5}
                            value={hour}
                            onChange={onHourChange}
                        />
                        <span className="text-xs text-primary-800">
                            {String(Math.floor(hour)).padStart(2, "0")}:
                            {hour % 1 === 0 ? "00" : "30"}
                        </span>
                    </div>
                    <FiSunset className="text-primary-800 mt-2" />
                </div>
            </div>
        </div>
    )
);

ExplorerHeader.displayName = "ExplorerHeader";

export default ExplorerHeader;
