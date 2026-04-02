import React from "react";

const Range: React.FC<{
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
}> = ({ value, min, max, step = 1, onChange }) => {
    return (
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            className="w-full max-h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary
        [&::-webkit-slider-runnable-track]:h-1
        [&::-webkit-slider-runnable-track]:rounded-lg
        [&::-webkit-slider-thumb]:appearance-none
        [&::-webkit-slider-thumb]:w-4
        [&::-webkit-slider-thumb]:h-4
        [&::-webkit-slider-thumb]:rounded-full
        [&::-webkit-slider-thumb]:bg-primary
        [&::-webkit-slider-thumb]:hover:bg-primary
        [&::-webkit-slider-thumb]:mt-[-6px]
        [&::-moz-range-track]:h-1
        [&::-moz-range-track]:rounded-lg
        [&::-moz-range-thumb]:w-4
        [&::-moz-range-thumb]:h-4
        [&::-moz-range-thumb]:rounded-full
        [&::-moz-range-thumb]:border-0
        [&::-moz-range-thumb]:bg-primary
        [&::-moz-range-thumb]:hover:bg-primary
        [&::-moz-range-thumb]:translate-y-0"
            onChange={(e) => onChange(Number(e.target.value))}
        />
    );
};

export { Range };
