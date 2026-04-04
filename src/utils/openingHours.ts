import { OpeningHours, OpenState, WeekDays } from "@phoenix344/opening-hours";

export type PlaceStatuses = "open" | "closed";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getOpeningHoursStatus = (openingHours: any): PlaceStatuses | undefined => {
    if (!openingHours) return;

    try {
        const oh = new OpeningHours({
            weekStart: WeekDays.Monday,
            locales: "en-US",
        });

        oh.fromJSON(openingHours);
        return oh.getState() === OpenState.Open ? "open" : "closed";
    } catch {
        return "closed";
    }
};

// ─── Detailed status for the place detail page ───────────────────────────────

const SOON_MINUTES = 30;

type Period = {
    open: { day: number; hour: number; minute: number };
    close: { day: number; hour: number; minute: number };
};

export type RawOpeningHours = {
    openNow?: boolean;
    periods?: Period[];
    weekdayDescriptions?: string[];
};

export type PlaceStatusDetailInfo = {
    key: "closesAt" | "opensAt";
    time: string;
};

export type PlaceStatusDetail = {
    status: "open" | "closed" | "closing soon" | "opening soon";
    detail?: PlaceStatusDetailInfo;
};

function toMinutes(hour: number, minute: number) {
    return hour * 60 + minute;
}

function formatTime(hour: number, minute: number): string {
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function getPlaceStatusDetail(
    openingHours: RawOpeningHours | undefined = {}
): PlaceStatusDetail | null {
    const periods = openingHours?.periods;
    if (!periods?.length) return null;

    const now = new Date();
    const currentDay = now.getDay(); // 0=Sun … 6=Sat, matches Google's format
    const currentMin = toMinutes(now.getHours(), now.getMinutes());
    const isOpen = openingHours.openNow;

    if (isOpen) {
        // Find the period active right now
        const active = periods.find((p) => {
            if (p.open.day === currentDay && toMinutes(p.open.hour, p.open.minute) <= currentMin)
                return true;
            // Handles periods that opened the previous day and close today (close time not yet passed)
            const prevDay = (currentDay + 6) % 7;
            return (
                p.open.day === prevDay &&
                p.close.day === currentDay &&
                toMinutes(p.close.hour, p.close.minute) > currentMin
            );
        });

        if (!active) return { status: "open" };

        const closeMin = toMinutes(active.close.hour, active.close.minute);
        const minutesLeft =
            active.close.day === currentDay
                ? closeMin - currentMin
                : closeMin + (24 * 60 - currentMin); // closes next day

        const closeDetail = {
            key: "closesAt" as const,
            time: formatTime(active.close.hour, active.close.minute),
        };

        return minutesLeft <= SOON_MINUTES
            ? { status: "closing soon", detail: closeDetail }
            : { status: "open", detail: closeDetail };
    }

    // Closed — find the next opening
    for (let i = 0; i <= 7; i++) {
        const day = (currentDay + i) % 7;
        const upcoming = periods
            .filter((p) => p.open.day === day)
            .find((p) => i > 0 || toMinutes(p.open.hour, p.open.minute) > currentMin);

        if (!upcoming) continue;

        const openMin = toMinutes(upcoming.open.hour, upcoming.open.minute);
        const minutesAway = i === 0 ? openMin - currentMin : i * 24 * 60 - currentMin + openMin;
        const openDetail = {
            key: "opensAt" as const,
            time: formatTime(upcoming.open.hour, upcoming.open.minute),
        };

        return minutesAway <= SOON_MINUTES
            ? { status: "opening soon", detail: openDetail }
            : { status: "closed", detail: openDetail };
    }

    return { status: "closed" };
}
