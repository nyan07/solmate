import { BsClock } from "react-icons/bs";
import { Expandable } from "@/components/Expandable";
import type { ExpandablePosition } from "@/components/Expandable";
import { PlaceStatusBadge } from "./PlaceStatusBadge";
import type { PlaceStatusDetail } from "@/utils/openingHours";
import { useTranslation } from "react-i18next";

type Props = {
    statusDetail: PlaceStatusDetail | null;
    weekdayDescriptions?: string[];
    position?: ExpandablePosition;
};

function to24h(time: string): string {
    return time.replace(/(\d+):(\d+)\s*(AM|PM)/gi, (_, h, m, period) => {
        let hour = parseInt(h);
        if (period.toUpperCase() === "AM" && hour === 12) hour = 0;
        if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
        return `${String(hour).padStart(2, "0")}:${m}`;
    });
}

// Map English day names (from Google Places API) to their index (0=Sun…6=Sat),
// then format using Intl for the active locale.
const EN_DAY_INDEX: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
};

// Jan 5 2025 is a Sunday — offset by index to get any weekday.
function localizeDay(englishDay: string, locale: string): string {
    const idx = EN_DAY_INDEX[englishDay];
    if (idx === undefined) return englishDay;
    return new Intl.DateTimeFormat(locale, { weekday: "long" }).format(new Date(2025, 0, 5 + idx));
}

export const PlaceOpeningHours = ({ statusDetail, weekdayDescriptions, position }: Props) => {
    const { i18n } = useTranslation();
    if (!statusDetail && !weekdayDescriptions?.length) return null;

    return (
        <Expandable
            icon={<BsClock className="w-4 h-4 text-neutral-500 shrink-0" />}
            title={statusDetail && <PlaceStatusBadge statusDetail={statusDetail} />}
            position={position}
        >
            {weekdayDescriptions?.length && (
                <table className="text-sm text-neutral-500 w-full">
                    <tbody>
                        {weekdayDescriptions.map((line) => {
                            const [day, time] = line.split(": ");
                            return (
                                <tr key={line}>
                                    <td className="pr-4 py-0.5 font-medium whitespace-nowrap">
                                        {localizeDay(day, i18n.language)}
                                    </td>
                                    <td>{time ? to24h(time) : time}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </Expandable>
    );
};
