import { BsCalendar3 } from "react-icons/bs";
import React, { useCallback, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { useClickOutside } from "@/hooks/useClickOutside";

const DatePicker: React.FC<{
    value: Date;
    onChange: (date: Date) => void;
}> = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useClickOutside(
        ref,
        useCallback(() => setOpen(false), []),
        open
    );

    return (
        <div className="relative" ref={ref}>
            <div className="flex">
                <button
                    onClick={() => setOpen(!open)}
                    className="rounded-full bg-none hover:bg-primary/50"
                >
                    <BsCalendar3 className="text-primary w-4 h-4" />
                </button>

                {open && (
                    <div className="absolute top-full mt-7 bg-primary rounded-lg shadow-lg z-50 text-primary-50 text-xs p-3">
                        <DayPicker
                            mode="single"
                            selected={value}
                            onSelect={(date) => {
                                if (date) {
                                    onChange(date);
                                    setOpen(false);
                                }
                            }}
                            style={
                                {
                                    "--rdp-accent-color": "#bac2de",
                                    "--rdp-accent-background-color": "#bac2de33",
                                    "--rdp-day-height": "32px",
                                    "--rdp-day-width": "32px",
                                    "--rdp-day_button-height": "26px",
                                    "--rdp-day_button-width": "26px",
                                    color: "#f7f8fc",
                                } as React.CSSProperties
                            }
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export { DatePicker };
