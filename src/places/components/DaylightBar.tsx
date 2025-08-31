import React from "react";

type DaylightBarProps = {
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
};

// Convert "HH:MM" to fractional hours (e.g., "14:30" => 14.5)
const timeToHours = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return Math.max(0, Math.min(24, hours + minutes / 60));
};

export const DaylightBar: React.FC<DaylightBarProps> = ({ startTime, endTime }) => {
  const startHour = timeToHours(startTime);
  const endHour = timeToHours(endTime);

  const leftPercent = (startHour / 24) * 100;
  const widthPercent = ((endHour - startHour) / 24) * 100;

  return (
    <div className="w-full">
      <div className="relative h-2 bg-primary rounded-full">
        {/* Sunlight bar */}
        <div
          className="absolute h-2 bg-neutral-light rounded-full"
          style={{
            left: `${leftPercent}%`,
            width: `${widthPercent}%`,
          }}
        />
      </div>
      {/* Labels */}
      <div className="flex justify-between text-sm mt-1 w-full relative h-6">
        <span className="absolute w-16 text-center -ml-8" style={{ left: `${leftPercent}%`}}>{startTime}</span>
        <span className="absolute w-16 text-center -ml-8" style={{ left: `${leftPercent + widthPercent}%`}}>{endTime}</span>
      </div>
    </div>
  );
};
