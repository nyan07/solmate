import { FiCalendar } from "react-icons/fi";
import React, { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

const DatePicker: React.FC<{
    value: Date;
    onChange: (date: Date) => void;
}> = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative inline-block">
            <button
                onClick={() => setOpen(!open)}
                className="p-2 rounded-full bg-none hover:bg-primary/50"
            >
                <FiCalendar className="text-primary" size={20} />
            </button>

            {open && (
                <div className="absolute top-10 left-0 bg-white border rounded-lg shadow-lg z-50">
                    <DayPicker
                        mode="single"
                        selected={value}
                        onSelect={(date) => {
                            if (date) {
                                onChange(date);
                                setOpen(false);
                            }
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export { DatePicker }