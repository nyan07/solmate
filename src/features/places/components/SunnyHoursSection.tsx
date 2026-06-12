import React from "react";
import { useTranslation } from "react-i18next";
import { useSelectedSunnyWindows } from "@/features/explorer/state/mapStore";

export const SunnyHoursSection: React.FC = () => {
    const { t } = useTranslation();
    const { selectedSunnyWindows } = useSelectedSunnyWindows();

    // null means the windows haven't been computed yet (terrain still loading)
    if (selectedSunnyWindows === null) return null;

    return (
        <div className="flex flex-col gap-2">
            <span className="font-medium text-sm">{t("place.sunnyHours.title")}</span>
            {selectedSunnyWindows.length === 0 ? (
                <p className="text-sm text-primary-500">{t("place.sunnyHours.none")}</p>
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
