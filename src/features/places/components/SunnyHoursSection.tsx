import React from "react";
import { useTranslation } from "react-i18next";
import { useSunnyHours } from "@/features/places/hooks/useSunnyHours";
import type { LatLng } from "@/types/LatLng";

type SunnyHoursSectionProps = {
    location: LatLng;
    date: Date;
};

export const SunnyHoursSection: React.FC<SunnyHoursSectionProps> = ({ location, date }) => {
    const { t } = useTranslation();
    const windows = useSunnyHours(date, location);

    return (
        <div className="flex flex-col gap-2">
            <span className="font-medium text-sm">{t("place.sunnyHours.title")}</span>
            {windows.length === 0 ? (
                <p className="text-sm text-primary-500">{t("place.sunnyHours.none")}</p>
            ) : (
                <ul className="flex flex-col gap-1">
                    {windows.map((w) => (
                        <li key={`${w.start}-${w.end}`} className="text-sm">
                            {w.start} – {w.end}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
