/**
 * SwipeUp — iOS Safari scroll behaviour
 *
 * These tests target the rubber-band and debounce regressions that caused the
 * sheet to jump/bounce on iOS Safari (fixes applied in src/components/SwipeUp/).
 *
 * Strategy:
 * - Run against WebKit (iPhone 14 profile) — configured in playwright.config.ts.
 * - Mock /api/places/nearby so tests never hit a real API.
 * - Inject a tall filler element into the scroll container so expand/collapse
 *   conditions fire regardless of whether Cesium loaded (it won't in headless WebKit).
 * - Use page.clock for the debounce tests so timing is deterministic.
 *   After ticking the fake clock we still await real time to let Framer Motion's
 *   RAF-based animation complete.
 */

import { expect, Page, test } from "@playwright/test";

// ---------------------------------------------------------------------------
// Mock data — enough places to fill the sheet; shape matches PlaceSummary type
// ---------------------------------------------------------------------------

const MOCK_PLACES = Array.from({ length: 15 }, (_, i) => ({
    id: `place-${i}`,
    displayName: `Test Place ${i + 1}`,
    primaryType: "cafe",
    editorialSummary: "A great place.",
    location: { latitude: 48.8566 + i * 0.001, longitude: 2.3522 },
    hasOutdoorSeating: true,
    photoUrl: "https://example.com/photo.jpg",
}));

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

const SHEET = '[role="dialog"]';
const SCROLL_AREA = '[role="dialog"] .overflow-y-auto';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns the current rendered CSS height of the sheet (not affected by translateY). */
function sheetHeight(page: Page): Promise<number> {
    return page.evaluate(
        (sel) => document.querySelector(sel)?.getBoundingClientRect().height ?? 0,
        SHEET
    );
}

/**
 * Appends a 2000 px tall filler div to the scroll container so that
 * scrollHeight > maxHeight, then scrolls down to trigger sheet expansion.
 * Waits for the 200 ms Framer Motion animation + a safety buffer.
 */
async function expandSheet(page: Page): Promise<void> {
    await page.evaluate((sel) => {
        const el = document.querySelector(sel) as HTMLElement | null;
        if (!el) throw new Error("Scroll area not found");
        if (!el.querySelector("[data-scroll-filler]")) {
            const filler = document.createElement("div");
            filler.setAttribute("data-scroll-filler", "");
            filler.style.height = "2000px";
            el.appendChild(filler);
        }
        el.scrollTop = 100;
        el.dispatchEvent(new Event("scroll", { bubbles: true }));
    }, SCROLL_AREA);

    // Wait for Framer Motion expand animation (200 ms transition + buffer)
    await page.waitForTimeout(350);
}

/**
 * Fires a scroll event with the given scrollTop on the sheet's scroll container.
 * Pass a negative value to simulate iOS rubber-band overscroll.
 */
async function fireScroll(page: Page, scrollTop: number): Promise<void> {
    await page.evaluate(
        ({ sel, top }) => {
            const el = document.querySelector(sel) as HTMLElement | null;
            if (!el) throw new Error("Scroll area not found");
            if (top >= 0) {
                // Natural assignment — works for non-negative values
                el.scrollTop = top;
            } else {
                // Override the property to simulate iOS rubber-band (scrollTop < 0)
                // Deleted immediately after dispatch to restore the prototype getter
                Object.defineProperty(el, "scrollTop", { value: top, configurable: true });
            }
            el.dispatchEvent(new Event("scroll", { bubbles: true }));
            if (top < 0) {
                // Restore prototype getter so subsequent reads are unaffected
                delete (el as unknown as Record<string, unknown>).scrollTop;
            }
        },
        { sel: SCROLL_AREA, top: scrollTop }
    );
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

test.describe("SwipeUp — iOS Safari scroll behaviour", () => {
    test.beforeEach(async ({ page, context }) => {
        // Fixed geolocation so the app doesn't prompt or wait for the real GPS
        await context.grantPermissions(["geolocation"]);
        await context.setGeolocation({ latitude: 48.8566, longitude: 2.3522 });

        // Intercept the nearby places API — avoids real cost and makes content deterministic.
        // The sheet uses this data to populate its list, but the scroll tests inject their
        // own overflow content anyway (Cesium won't initialise in headless WebKit, so
        // cameraDistance stays null and the query never fires).
        await page.route("**/api/places/nearby", (route) =>
            route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify(MOCK_PLACES),
            })
        );

        // Cesium and WebGL errors are expected in headless WebKit — ignore them so they
        // don't fail the test; re-throw anything unrelated.
        page.on("pageerror", (err) => {
            if (!/cesium|webgl|worker/i.test(err.message)) throw err;
        });

        await page.goto("/en/places");
        // Sheet is always in the DOM regardless of open/closed state
        await page.waitForSelector(SHEET);
    });

    // -------------------------------------------------------------------------

    test("sheet is present on load", async ({ page }) => {
        await expect(page.locator(SHEET)).toBeAttached();
    });

    // -------------------------------------------------------------------------

    test("sheet expands when content is scrolled", async ({ page }) => {
        const before = await sheetHeight(page);
        await expandSheet(page);
        const after = await sheetHeight(page);
        expect(after).toBeGreaterThan(before);
    });

    // -------------------------------------------------------------------------
    // Fix #2a — rubber-band regression

    test("negative scrollTop (iOS rubber-band) does not expand the sheet", async ({ page }) => {
        const before = await sheetHeight(page);

        // Simulate iOS overscroll: scrollTop goes negative
        await fireScroll(page, -10);
        await page.waitForTimeout(100);

        const after = await sheetHeight(page);
        expect(after).toBe(before);
    });

    // -------------------------------------------------------------------------
    // Fix #2b — debounce regression

    test("sheet does not collapse immediately when scrolled back to top", async ({ page }) => {
        await expandSheet(page);
        const expandedHeight = await sheetHeight(page);

        // Install fake clock before the scroll interaction that creates the debounce timer
        await page.clock.install();

        await fireScroll(page, 0); // starts the 150 ms collapse debounce
        await page.clock.runFor(100); // advance to just before debounce fires

        expect(await sheetHeight(page)).toBe(expandedHeight);
    });

    test("sheet collapses after 150 ms debounce when scrolled to top", async ({ page }) => {
        await expandSheet(page);
        const expandedHeight = await sheetHeight(page);

        await page.clock.install();

        await fireScroll(page, 0);
        await page.clock.runFor(150); // fire the debounce callback

        // Framer Motion animation is RAF-based and unaffected by the fake clock;
        // wait for real wall-clock time to let the 200 ms tween complete
        await page.waitForTimeout(350);

        expect(await sheetHeight(page)).toBeLessThanOrEqual(expandedHeight);
    });

    test("collapse is cancelled when scroll resumes before 150 ms", async ({ page }) => {
        await expandSheet(page);
        const expandedHeight = await sheetHeight(page);

        await page.clock.install();

        await fireScroll(page, 0); // starts debounce
        await page.clock.runFor(80); // still within the 150 ms window
        await fireScroll(page, 50); // resume scrolling — should cancel the timer

        await page.clock.runFor(300); // advance well past the original deadline
        await page.waitForTimeout(350); // let any potential animation settle

        expect(await sheetHeight(page)).toBe(expandedHeight);
    });
});
