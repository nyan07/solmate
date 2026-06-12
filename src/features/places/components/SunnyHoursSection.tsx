import React from "react";
import { useTranslation } from "react-i18next";
import { useSelectedSunnyWindows } from "@/features/explorer/state/mapStore";

function isSameCalendarDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

export const SunnyHoursSection: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { selectedSunnyWindows, explorerDate } = useSelectedSunnyWindows();

    // null means the windows haven't been computed yet (terrain still loading)
    if (selectedSunnyWindows === null) return null;

    const isToday = isSameCalendarDay(explorerDate, new Date());
    const formattedDate = explorerDate.toLocaleDateString(i18n.language, {
        month: "long",
        day: "numeric",
    });

    const titleKey = isToday ? "place.sunnyHours.title" : "place.sunnyHours.titleOnDate";
    const noneKey = isToday ? "place.sunnyHours.none" : "place.sunnyHours.noneOnDate";

    return (
        <div className="flex flex-col gap-2">
            <span className="font-medium text-sm">{t(titleKey, { date: formattedDate })}</span>
            {selectedSunnyWindows.length === 0 ? (
                <p className="text-sm text-primary-500">{t(noneKey, { date: formattedDate })}</p>
            ) : (
                <ul className="flex flex-col gap-1">
                    {selectedSunnyWindows.map((w) => (
                        <li key={`${w.start}-${w.end}`} className="text-sm">
                            {w.start} – {w.end}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
