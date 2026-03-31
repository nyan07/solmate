import { ClockIcon } from "@heroicons/react/24/outline";
import { Expandable } from "../../components/Expandable";
import type { ExpandablePosition } from "../../components/Expandable";
import { PlaceStatusBadge } from "./PlaceStatusBadge";
import type { PlaceStatusDetail } from "../../utils/openingHours";

type Props = {
    statusDetail: PlaceStatusDetail | null;
    weekdayDescriptions?: string[];
    position?: ExpandablePosition;
};

function to24h(time: string): string {
    return time.replace(/(\d+):(\d+)\s*(AM|PM)/gi, (_, h, m, period) => {
        let hour = parseInt(h);
        if (period.toUpperCase() === 'AM' && hour === 12) hour = 0;
        if (period.toUpperCase() === 'PM' && hour !== 12) hour += 12;
        return `${String(hour).padStart(2, '0')}:${m}`;
    });
}

export const PlaceOpeningHours = ({ statusDetail, weekdayDescriptions, position }: Props) => {
    if (!statusDetail && !weekdayDescriptions?.length) return null;

    return (
        <Expandable
            icon={<ClockIcon className="w-4 h-4 text-neutral-dark/50 shrink-0" />}
            title={statusDetail && <PlaceStatusBadge statusDetail={statusDetail} />}
            position={position}
        >
            {weekdayDescriptions?.length && (
                <table className="text-sm text-neutral-dark/70 w-full">
                    <tbody>
                        {weekdayDescriptions.map((line) => {
                            const [day, time] = line.split(": ");
                            return (
                                <tr key={line}>
                                    <td className="pr-4 py-0.5 font-medium whitespace-nowrap">{day}</td>
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
