import { BsCalendar3 } from "react-icons/bs";
import React, { useCallback, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { useTranslation } from "react-i18next";
import { useClickOutside } from "@/hooks/useClickOutside";
import Button from "@/components/Button";

function startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

const DatePicker: React.FC<{
    value: Date;
    onChange: (date: Date) => void;
}> = ({ value, onChange }) => {
    const { t, i18n } = useTranslation();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useClickOutside(
        ref,
        useCallback(() => setOpen(false), []),
        open
    );

    const today = startOfDay(new Date());
    const diffDays = Math.round((startOfDay(value).getTime() - today.getTime()) / 86400000);

    const label =
        diffDays === 0
            ? t("explorer.today")
            : value.toLocaleDateString(i18n.language, { day: "2-digit", month: "2-digit" });

    return (
        <div className="relative" ref={ref}>
            <div className="flex">
                <Button
                    onClick={() => setOpen(!open)}
                    variant="ghost"
                    size="sm"
                    className="w-20"
                    leadingIcon={<BsCalendar3 />}
                >
                    {label}
                </Button>

                {open && (
                    <div className="absolute top-full mt-7 bg-primary rounded-lg shadow-lg z-50 text-primary-50 text-xs p-3">
                        <DayPicker
                            mode="single"
                            selected={value}
                            disabled={{ before: new Date() }}
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
