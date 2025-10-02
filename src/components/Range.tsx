import React from "react";

const Range: React.FC<{
    value: number;
    min: number,
    max: number,
    onChange: (value: number) => void;
}> = ({ value, min, max, onChange }) => {
    return (
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            className="flex-1 h-2 bg-neutral-light rounded-lg appearance-none cursor-pointer accent-primary
                 [&::-webkit-slider-thumb]:appearance-none
                 [&::-webkit-slider-thumb]:w-4
                 [&::-webkit-slider-thumb]:h-4
                 [&::-webkit-slider-thumb]:rounded-full
                 [&::-webkit-slider-thumb]:bg-primary/80
                 [&::-webkit-slider-thumb]:hover:bg-primry
                 [&::-moz-range-thumb]:w-4
                 [&::-moz-range-thumb]:h-4
                 [&::-moz-range-thumb]:rounded-full
                 [&::-moz-range-thumb]:bg-primary/80
                 [&::-moz-range-thumb]:hover:bg-primary"
            onChange={(e) => onChange(Number(e.target.value))}
        />
    );
};

export { Range }
