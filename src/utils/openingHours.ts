import { OpeningHours, OpenState, WeekDays } from '@phoenix344/opening-hours';
import type { PlaceStatuses } from '../places/types/PlaceStatuses';

export const getOpeningHoursStatus = (openingHours: any): PlaceStatuses | undefined => {
    if (!openingHours) return; 

    try {
        const oh = new OpeningHours({
            weekStart: WeekDays.Monday,
            locales: 'en-US'
        });

        oh.fromJSON(openingHours);
        return oh.getState() === OpenState.Open ? "open" : "closed";
    } catch (e) {
        return "closed"
    }
}