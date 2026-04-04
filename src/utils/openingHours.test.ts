import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getPlaceStatusDetail } from "./openingHours";

// All tests use Monday 2026-04-06 as the reference day (getDay() === 1).
// Time is set per-test via vi.setSystemTime.

const MON = 1;
const SUN = 0;
const TUE = 2;

// A period that opened today (Mon) at 10:00 and closes today at 20:00
const periodTodayOnly = {
    open: { day: MON, hour: 10, minute: 0 },
    close: { day: MON, hour: 20, minute: 0 },
};

// A period opened yesterday (Sun) at 22:00 and closes today (Mon) at 03:00
const periodOvernightCloseToday = {
    open: { day: SUN, hour: 22, minute: 0 },
    close: { day: MON, hour: 3, minute: 0 },
};

// A period that opens today (Mon) at 16:00 and closes next day (Tue) at 02:00
const periodOpensTodayClosesTomorrow = {
    open: { day: MON, hour: 16, minute: 0 },
    close: { day: TUE, hour: 2, minute: 0 },
};

// A period that opens today (Mon) at 17:00 (for "opening soon" tests)
const periodOpensTodayAt17 = {
    open: { day: MON, hour: 17, minute: 0 },
    close: { day: MON, hour: 22, minute: 0 },
};

function setTime(isoDateTime: string) {
    vi.setSystemTime(new Date(isoDateTime));
}

describe("getPlaceStatusDetail", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("returns null when there are no periods", () => {
        setTime("2026-04-06T14:00:00");
        expect(getPlaceStatusDetail({ openNow: true, periods: [] })).toBeNull();
        expect(getPlaceStatusDetail({})).toBeNull();
        expect(getPlaceStatusDetail(undefined)).toBeNull();
    });

    // ── isOpen = true ──────────────────────────────────────────────────────────

    it("returns open with closing time when more than 30 min remain today", () => {
        setTime("2026-04-06T14:00:00"); // 14:00, closes at 20:00 → 360 min left
        expect(getPlaceStatusDetail({ openNow: true, periods: [periodTodayOnly] })).toEqual({
            status: "open",
            detail: { key: "closesAt", time: "20:00" },
        });
    });

    it("returns closing soon when ≤ 30 min remain today", () => {
        setTime("2026-04-06T19:45:00"); // 19:45, closes at 20:00 → 15 min left
        expect(getPlaceStatusDetail({ openNow: true, periods: [periodTodayOnly] })).toEqual({
            status: "closing soon",
            detail: { key: "closesAt", time: "20:00" },
        });
    });

    it("returns closing soon exactly at the 30-min boundary", () => {
        setTime("2026-04-06T19:30:00"); // exactly 30 min before close
        expect(getPlaceStatusDetail({ openNow: true, periods: [periodTodayOnly] })).toEqual({
            status: "closing soon",
            detail: { key: "closesAt", time: "20:00" },
        });
    });

    it("returns open (not closing soon) at 31 min before close", () => {
        setTime("2026-04-06T19:29:00"); // 31 min before close
        expect(getPlaceStatusDetail({ openNow: true, periods: [periodTodayOnly] })).toEqual({
            status: "open",
            detail: { key: "closesAt", time: "20:00" },
        });
    });

    it("returns open with next-day closing time when closes tomorrow", () => {
        setTime("2026-04-06T18:00:00"); // 18:00, period opens 16:00 → closes Tue 02:00 → 8h left
        expect(
            getPlaceStatusDetail({ openNow: true, periods: [periodOpensTodayClosesTomorrow] })
        ).toEqual({ status: "open", detail: { key: "closesAt", time: "02:00" } });
    });

    it("returns open (no active period matched) when no period covers current time", () => {
        // It's 09:00 — before periodTodayOnly opens at 10:00
        setTime("2026-04-06T09:00:00");
        expect(getPlaceStatusDetail({ openNow: true, periods: [periodTodayOnly] })).toEqual({
            status: "open",
        });
    });

    // ── Bug regression: prev-day overnight period whose close time already passed ──

    it("does NOT flag closing soon for a prev-day period whose close time already passed (bug regression)", () => {
        // Period opened Sun 22:00, closes Mon 03:00.
        // It is now Mon 14:45 — the 03:00 close is 11h45m in the past.
        // Before the fix this computed minutesLeft = 180 - 885 = -705, triggering "closing soon".
        setTime("2026-04-06T14:45:00");
        expect(
            getPlaceStatusDetail({ openNow: true, periods: [periodOvernightCloseToday] })
        ).toEqual({ status: "open" }); // no active period → falls through to plain "open"
    });

    it("does flag closing soon for a prev-day period whose close time has NOT yet passed", () => {
        // Period opened Sun 22:00, closes Mon 03:00.
        // It is now Mon 02:45 — 15 min before close.
        setTime("2026-04-06T02:45:00");
        expect(
            getPlaceStatusDetail({ openNow: true, periods: [periodOvernightCloseToday] })
        ).toEqual({ status: "closing soon", detail: { key: "closesAt", time: "03:00" } });
    });

    it("returns open (not closing soon) for a prev-day period with more than 30 min left", () => {
        // Period opened Sun 22:00, closes Mon 03:00.
        // It is now Mon 02:00 — 60 min before close.
        setTime("2026-04-06T02:00:00");
        expect(
            getPlaceStatusDetail({ openNow: true, periods: [periodOvernightCloseToday] })
        ).toEqual({ status: "open", detail: { key: "closesAt", time: "03:00" } });
    });

    // ── isOpen = false ─────────────────────────────────────────────────────────

    it("returns closed with next opening time when more than 30 min away", () => {
        setTime("2026-04-06T14:00:00"); // 14:00, next open at 17:00 → 180 min away
        expect(getPlaceStatusDetail({ openNow: false, periods: [periodOpensTodayAt17] })).toEqual({
            status: "closed",
            detail: { key: "opensAt", time: "17:00" },
        });
    });

    it("returns opening soon when ≤ 30 min until opening", () => {
        setTime("2026-04-06T16:45:00"); // 16:45, opens at 17:00 → 15 min away
        expect(getPlaceStatusDetail({ openNow: false, periods: [periodOpensTodayAt17] })).toEqual({
            status: "opening soon",
            detail: { key: "opensAt", time: "17:00" },
        });
    });

    it("returns opening soon exactly at the 30-min boundary", () => {
        setTime("2026-04-06T16:30:00"); // exactly 30 min before open
        expect(getPlaceStatusDetail({ openNow: false, periods: [periodOpensTodayAt17] })).toEqual({
            status: "opening soon",
            detail: { key: "opensAt", time: "17:00" },
        });
    });

    it("does not match a past opening time as upcoming for today when closed, falls back to next week", () => {
        // 21:00 — periodOpensTodayAt17 opened at 17:00, already past today.
        // The loop finds the same Mon period 7 days out → closed with next opening detail.
        setTime("2026-04-06T21:00:00");
        expect(getPlaceStatusDetail({ openNow: false, periods: [periodOpensTodayAt17] })).toEqual({
            status: "closed",
            detail: { key: "opensAt", time: "17:00" },
        });
    });
});
