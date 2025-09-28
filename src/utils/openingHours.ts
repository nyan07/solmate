import { OpeningHours, OpenState, WeekDays } from '@phoenix344/opening-hours';
import type { OpeningHoursPeriod } from '../places/types/PlaceSummary';
import type { PlaceStatuses } from '../places/types/PlaceStatuses';

function mapPeriodsToOpeningHours(
    periods: OpeningHoursPeriod[]
): { day: number; from: string; until: string }[] {
    return periods.map(p => {
        // converte day 0=Sunday..6=Saturday para 1=Monday..7=Sunday
        const mapDay = (day: number) => {
            const shifted = day + 1;
            return shifted > 7 ? 1 : shifted;
        };

        const toHHMM = (hour: number, minute: number) =>
            `${hour.toString().padStart(2, '0')}${minute
                .toString()
                .padStart(2, '0')}`;

        return {
            day: mapDay(p.open.day),
            from: toHHMM(p.open.hour, p.open.minute),
            until: toHHMM(p.close.hour, p.close.minute)
        };
    });
}


export const getOpeningHoursStatus = (periods: OpeningHoursPeriod[]): PlaceStatuses | undefined => {
    if (!periods) return; 

    try {
        const oh = new OpeningHours({
            weekStart: WeekDays.Monday,
            locales: 'en-US'
        });

        const mappedHours = mapPeriodsToOpeningHours(periods);
        oh.fromJSON(mappedHours);
        return oh.getState() === OpenState.Open ? "open" : "closed";
    } catch (e) {
        return "closed"
    }


}