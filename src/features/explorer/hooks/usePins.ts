import { useEffect, useRef, useState } from "react";
import {
    Cartesian3,
    Viewer,
    sampleTerrainMostDetailed,
    Cartographic,
    VerticalOrigin,
    Simon1994PlanetaryPositions,
    Matrix3,
    Transforms,
    Ray,
    JulianDate,
    BillboardCollection,
} from "cesium";
import pinSvgRaw from "@/assets/pin.svg?raw";
import cloudSvgRaw from "@/assets/cloud.svg?raw";
import sunSvgRaw from "@/assets/sun.svg?raw";
import { useFilteredPlaces } from "./useFilteredPlaces";
import {
    useLayout,
    useMapState,
    useSunlit,
    useSelectedSunnyWindows,
} from "@/features/explorer/state/mapStore";
import { MAX_CAMERA_DISTANCE, ENTITY_IDS } from "@/features/explorer/constants";
import { useLangNavigate } from "@/hooks/useLangNavigate";
import { useTranslation } from "react-i18next";
import { trackEvent } from "@/utils/analytics";
import { getOpenIntervalsForDay } from "@/utils/openingHours";
import { resolveGooglePlaceId } from "@/features/places/api";
import type { PlaceSummary } from "@/features/places/types";

const PIN_HEAD_OFFSET = 2; // meters above surface (terrain or building roof)
const ACCENT_COLOR = "#ff5a59";
const PIN_BG_COLOR = "#0D0A1A";
// Rendered billboard size in logical pixels — PAD gives room for the outline stroke
// PIN_H derived from PIN_W to preserve the path's natural 11:16 aspect ratio
const PIN_W = 23;
const PIN_H = Math.round((PIN_W * 16) / 11); // ~33
const PIN_PAD = 4; // padding on each side so outline stroke isn't clipped
const BILL_W = PIN_W + PIN_PAD * 2;
const BILL_H = PIN_H + PIN_PAD * 2;

// Extract the <path> from pin.svg to re-color stroke dynamically
const PIN_PATH_MATCH = pinSvgRaw.match(/<path[^>]*d="([^"]+)"[^>]*>/);
const PIN_PATH_D = PIN_PATH_MATCH ? PIN_PATH_MATCH[1] : "";
const PIN_STROKE_W = (pinSvgRaw.match(/stroke-width="([^"]+)"/) ?? [])[1] ?? "3";

// Extract the inner content of the icon SVGs (already have correct colors baked in)
function extractSvgInner(raw: string): { viewBox: string; inner: string } {
    const viewBox = (raw.match(/viewBox="([^"]+)"/) ?? [])[1] ?? "0 0 24 24";
    // Strip outer <svg> tags, keep everything inside
    const inner = raw
        .replace(/<\?xml[^>]*>/g, "")
        .replace(/<!DOCTYPE[^>]*>/g, "")
        .replace(/<svg[^>]*>/, "")
        .replace(/<\/svg>\s*$/, "")
        .trim();
    return { viewBox, inner };
}

const CLOUD_ICON = extractSvgInner(cloudSvgRaw);
const SUN_ICON = extractSvgInner(sunSvgRaw);

function buildPinSvgUrl(selected: boolean, sunlit: boolean): string {
    const outlineColor = selected ? ACCENT_COLOR : PIN_BG_COLOR;
    const icon = sunlit ? SUN_ICON : CLOUD_ICON;
    const iconSize = 14;
    const iconX = (PIN_W - iconSize) / 2;
    const iconY = (PIN_H * 0.6 - iconSize) / 2 + (sunlit ? 2 : 0);

    // viewBox starts at -PIN_PAD so outline stroke on all edges isn't clipped
    const vb = `-${PIN_PAD} -${PIN_PAD} ${BILL_W} ${BILL_H}`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${BILL_W}" height="${BILL_H}" viewBox="${vb}">
  <path d="${PIN_PATH_D}" fill="${PIN_BG_COLOR}" stroke="${outlineColor}" stroke-width="${PIN_STROKE_W}" stroke-linejoin="round"/>
  <svg x="${iconX}" y="${iconY}" width="${iconSize}" height="${iconSize}" viewBox="${icon.viewBox}">
    ${icon.inner}
  </svg>
</svg>`;

    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const PIN_SHADOW_IMAGE = buildPinSvgUrl(false, false);
const PIN_SUN_IMAGE = buildPinSvgUrl(false, true);
const SELECTED_SHADOW_IMAGE = buildPinSvgUrl(true, false);
const SELECTED_SUN_IMAGE = buildPinSvgUrl(true, true);

const SUNNY_HOURS_STEP = 30; // minutes

function padTwo(n: number) {
    return String(n).padStart(2, "0");
}

function minutesToTimeString(minutes: number) {
    return `${padTwo(Math.floor(minutes / 60))}:${padTwo(minutes % 60)}`;
}

function getSunDirectionECEF(time: JulianDate): Cartesian3 | null {
    const icrfToFixed = Transforms.computeIcrfToFixedMatrix(time, new Matrix3());
    if (!icrfToFixed) return null;
    const sunPosInertial = Simon1994PlanetaryPositions.computeSunPositionInEarthInertialFrame(time);
    const sunPosECEF = Matrix3.multiplyByVector(icrfToFixed, sunPosInertial, new Cartesian3());
    return Cartesian3.normalize(sunPosECEF, new Cartesian3());
}

export const usePins = (
    viewer: Viewer | null,
    visible: boolean,
    selectedPlaceId: string | null | undefined = null,
    sunTime: JulianDate | null = null
) => {
    const { bounds, cameraDistance } = useMapState();
    const { topBarHeight } = useLayout();
    const { setSunlitIds } = useSunlit();
    const { setSelectedSunnyWindows, explorerDate } = useSelectedSunnyWindows();
    const navigate = useLangNavigate();
    const { i18n } = useTranslation();
    const { data: places } = useFilteredPlaces(bounds, {
        enabled: !!cameraDistance && cameraDistance <= MAX_CAMERA_DISTANCE,
        lang: i18n.language,
    });

    // raw terrain height per place (meters above ellipsoid)
    const [terrainHeights, setTerrainHeights] = useState<Record<string, number>>({});
    // pin head height: above building roof (or terrain if no building)
    const [pinTopHeights, setPinTopHeights] = useState<Record<string, number>>({});

    const managedIds = useRef<Set<string>>(new Set());
    const appliedPinTops = useRef<Record<string, number>>({});
    const placesRef = useRef<PlaceSummary[]>([]);
    placesRef.current = places ?? [];
    const sunlitIds = useRef<Set<string>>(new Set());
    const groundPositions = useRef<Record<string, Cartesian3>>({});
    const headPositions = useRef<Record<string, Cartesian3>>({});
    const selectedIdRef = useRef<string | null | undefined>(null);
    selectedIdRef.current = selectedPlaceId;

    // Dedicated BillboardCollection in scene.primitives for the selected-pin overlay.
    // Cesium sorts all billboards within a single BillboardCollection by depth (back-to-front)
    // for translucency, making insertion order unreliable for overlapping pins. Primitives in
    // scene.primitives are rendered in strict order, so this collection — always raised to the
    // top — is guaranteed to draw after every entity billboard.
    const overlayCollectionRef = useRef<BillboardCollection | null>(null);

    useEffect(() => {
        if (!viewer) return;
        const collection = new BillboardCollection({ scene: viewer.scene });
        viewer.scene.primitives.add(collection);
        overlayCollectionRef.current = collection;
        return () => {
            overlayCollectionRef.current = null;
            if (!viewer.isDestroyed() && !collection.isDestroyed()) {
                viewer.scene.primitives.remove(collection);
            }
        };
    }, [viewer]);

    // Rebuild the overlay billboard.
    // Cesium sorts ALL translucent draw commands back-to-front by bounding-volume distance every
    // frame, so primitive collection order and raiseToTop have no effect on the final draw order.
    // The only reliable way to win the sort is to place the overlay physically closer to the
    // camera: offset it 5 m outward along the surface normal so it always beats overlapping pins.
    const syncOverlay = (id: string | null, show: boolean) => {
        const collection = overlayCollectionRef.current;
        if (!collection || collection.isDestroyed()) return;
        collection.removeAll();
        if (!id || !show) return;
        const headPos = headPositions.current[id];
        if (!headPos) return;
        const radialUp = Cartesian3.normalize(headPos, new Cartesian3());
        const overlayPos = Cartesian3.add(
            headPos,
            Cartesian3.multiplyByScalar(radialUp, 5, new Cartesian3()),
            new Cartesian3()
        );
        const isLit = sunlitIds.current.has(id);
        collection.add({
            image: isLit ? SELECTED_SUN_IMAGE : SELECTED_SHADOW_IMAGE,
            position: overlayPos,
            width: BILL_W,
            height: BILL_H,
            verticalOrigin: VerticalOrigin.BOTTOM,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
        });
    };

    // Navigate on entity click
    useEffect(() => {
        if (!viewer) return;
        const handler = async (entity: { id?: string } | undefined) => {
            if (!entity?.id) return;
            const prefix = ENTITY_IDS.placeBillboard("");
            if (!entity.id.startsWith(prefix)) return;
            const placeId = entity.id.slice(prefix.length);
            trackEvent("pin_clicked", { place_id: placeId });
            if (placeId.startsWith("osm:")) {
                const place = placesRef.current.find((p) => p.id === placeId);
                if (!place) return;
                const googleId = await resolveGooglePlaceId(place.displayName, place.location);
                if (googleId) navigate(`/places/${googleId}`);
            } else {
                navigate(`/places/${placeId}`);
            }
        };
        viewer.selectedEntityChanged.addEventListener(handler);
        return () => {
            viewer.selectedEntityChanged.removeEventListener(handler);
        };
    }, [viewer, navigate]);

    // Fly to selected place
    useEffect(() => {
        if (!viewer || !selectedPlaceId || !places?.length) return;
        const place = places.find((p) => p.id === selectedPlaceId);
        if (!place) return;
        const canvas = viewer.scene.canvas;
        const altitude = viewer.camera.positionCartographic.height;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fovY: number = (viewer.camera.frustum as any).fovy ?? Math.PI / 3;
        const metersPerPixel = (2 * altitude * Math.tan(fovY / 2)) / canvas.clientHeight;
        const swipeOpenHeight = Math.round(canvas.clientHeight * 0.7);
        const dyPx = (topBarHeight - swipeOpenHeight) / 2 + topBarHeight;
        const latOffsetDeg = (dyPx * metersPerPixel) / 111111;
        viewer.camera.flyTo({
            destination: Cartesian3.fromDegrees(
                place.location.longitude,
                place.location.latitude + latOffsetDeg,
                altitude
            ),
            duration: 0.6,
        });
    }, [viewer, selectedPlaceId]);

    // Sample terrain heights async
    useEffect(() => {
        if (!viewer || !places?.length) return;
        const missing = places.filter((p) => terrainHeights[p.id] == null);
        if (!missing.length) return;
        let cancelled = false;
        const load = async () => {
            const cartographics = missing.map((p) =>
                Cartographic.fromDegrees(p.location.longitude, p.location.latitude)
            );
            const samples = await sampleTerrainMostDetailed(viewer.terrainProvider, cartographics);
            if (cancelled) return;
            setTerrainHeights((prev) => {
                const next = { ...prev };
                missing.forEach((p, i) => {
                    next[p.id] = samples[i].height ?? 0;
                });
                return next;
            });
        };
        load().catch((err) =>
            console.error("Terrain sampling failed", { count: missing.length }, err)
        );
        return () => {
            cancelled = true;
        };
    }, [viewer, places]);

    // Detect building heights via downward ray — positions pin head above roof
    useEffect(() => {
        if (!viewer || !places?.length) return;
        const missing = places.filter(
            (p) => terrainHeights[p.id] != null && pinTopHeights[p.id] == null
        );
        if (!missing.length) return;
        const updates: Record<string, number> = {};
        missing.forEach((place) => {
            const { latitude, longitude } = place.location;
            const terrain = terrainHeights[place.id];
            const searchFrom = Cartesian3.fromDegrees(longitude, latitude, terrain + 300);
            const radialDown = Cartesian3.negate(
                Cartesian3.normalize(searchFrom, new Cartesian3()),
                new Cartesian3()
            );
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const hit = (viewer.scene as any).pickFromRay(new Ray(searchFrom, radialDown));
            const surfaceHeight = hit?.position
                ? Cartographic.fromCartesian(hit.position).height
                : terrain;
            updates[place.id] = Math.max(surfaceHeight, terrain) + PIN_HEAD_OFFSET;
        });
        setPinTopHeights((prev) => ({ ...prev, ...updates }));
    }, [viewer, places, terrainHeights]);

    // Remove entities for places that left the visible set
    useEffect(() => {
        if (!viewer) return;
        const currentIds = new Set(places?.map((p) => p.id) ?? []);
        managedIds.current.forEach((id) => {
            if (!currentIds.has(id)) {
                const billboard = viewer.entities.getById(ENTITY_IDS.placeBillboard(id));
                if (billboard) viewer.entities.remove(billboard);
                const line = viewer.entities.getById(ENTITY_IDS.placeLine(id));
                if (line) viewer.entities.remove(line);
                managedIds.current.delete(id);
                delete appliedPinTops.current[id];
            }
        });
    }, [viewer, places]);

    // Create/update billboard entities
    useEffect(() => {
        if (!viewer || !places?.length) return;
        let addedAny = false;
        places.forEach((place) => {
            const terrain = terrainHeights[place.id];
            const pinTop = pinTopHeights[place.id];
            if (terrain == null || pinTop == null) return;

            const { latitude, longitude } = place.location;
            const alreadyApplied = appliedPinTops.current[place.id] === pinTop;
            const groundPos = Cartesian3.fromDegrees(longitude, latitude, terrain);
            const headPos = Cartesian3.fromDegrees(longitude, latitude, pinTop);
            const isLit = sunlitIds.current.has(place.id);

            const billboard = viewer.entities.getById(ENTITY_IDS.placeBillboard(place.id));
            if (!billboard) {
                addedAny = true;
                const isSelected = place.id === selectedIdRef.current;
                viewer.entities.add({
                    id: ENTITY_IDS.placeBillboard(place.id),
                    // hide underlying entity when selected — overlay primitive sits on top
                    show: visible && !isSelected,
                    position: headPos,
                    billboard: {
                        image: isLit ? PIN_SUN_IMAGE : PIN_SHADOW_IMAGE,
                        width: BILL_W,
                        height: BILL_H,
                        verticalOrigin: VerticalOrigin.BOTTOM,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    },
                });
            } else if (!alreadyApplied) {
                billboard.position = headPos as never;
            }

            managedIds.current.add(place.id);
            appliedPinTops.current[place.id] = pinTop;
            groundPositions.current[place.id] = groundPos;
            headPositions.current[place.id] = headPos;
        });

        // Re-raise overlay collection after new entity billboards were inserted
        if (addedAny && selectedIdRef.current) {
            syncOverlay(selectedIdRef.current, visible);
        }
    }, [viewer, places, terrainHeights, pinTopHeights, visible]);

    // Shadow check — update billboard image
    useEffect(() => {
        if (!viewer || !sunTime) return;
        const sunDir = getSunDirectionECEF(sunTime);
        if (!sunDir) return;
        managedIds.current.forEach((id) => {
            const groundPos = groundPositions.current[id];
            if (!groundPos) return;
            const radialUp = Cartesian3.normalize(groundPos, new Cartesian3());
            const origin = Cartesian3.add(
                groundPos,
                Cartesian3.multiplyByScalar(radialUp, 1, new Cartesian3()),
                new Cartesian3()
            );
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const hit = (viewer.scene as any).pickFromRay(new Ray(origin, sunDir));
            const inSunlight = !hit?.position;
            if (inSunlight) sunlitIds.current.add(id);
            else sunlitIds.current.delete(id);

            const isLit = inSunlight;
            if (id === selectedPlaceId) {
                const collection = overlayCollectionRef.current;
                if (collection && !collection.isDestroyed() && collection.length > 0) {
                    collection.get(0).image = isLit ? SELECTED_SUN_IMAGE : SELECTED_SHADOW_IMAGE;
                }
            } else {
                const billboard = viewer.entities.getById(ENTITY_IDS.placeBillboard(id));
                if (billboard?.billboard)
                    billboard.billboard.image = (isLit ? PIN_SUN_IMAGE : PIN_SHADOW_IMAGE) as never;
            }
        });
        setSunlitIds(new Set(sunlitIds.current));
    }, [viewer, sunTime, pinTopHeights, setSunlitIds]);

    // Compute sunny windows for the selected place using Cesium ray casting,
    // clipped to the place's opening hours for the selected day.
    useEffect(() => {
        if (!viewer || !selectedPlaceId) {
            setSelectedSunnyWindows(null);
            return;
        }
        const groundPos = groundPositions.current[selectedPlaceId];
        if (!groundPos) return; // terrain not loaded yet — effect re-runs when pinTopHeights updates

        const today = explorerDate;
        const radialUp = Cartesian3.normalize(groundPos, new Cartesian3());
        // Offset origin 1 m up along surface normal (same as shadow-check effect)
        const origin = Cartesian3.add(
            groundPos,
            Cartesian3.multiplyByScalar(radialUp, 1, new Cartesian3()),
            new Cartesian3()
        );

        // Collect raw sunny minute ranges
        type MinuteRange = { start: number; end: number };
        const rawRanges: MinuteRange[] = [];
        let rangeStart: number | null = null;
        let lastSunny: number | null = null;

        for (let m = 0; m < 24 * 60; m += SUNNY_HOURS_STEP) {
            const d = new Date(today);
            d.setHours(0, m, 0, 0);
            const jd = JulianDate.fromDate(d);
            const sunDir = getSunDirectionECEF(jd);

            let inSunlight = false;
            if (sunDir) {
                // Only check when sun is above the local horizon
                const aboveHorizon = Cartesian3.dot(sunDir, radialUp) > 0;
                if (aboveHorizon) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const hit = (viewer.scene as any).pickFromRay(new Ray(origin, sunDir));
                    inSunlight = !hit?.position;
                }
            }

            if (inSunlight) {
                if (rangeStart === null) rangeStart = m;
                lastSunny = m;
            } else {
                if (rangeStart !== null && lastSunny !== null) {
                    rawRanges.push({ start: rangeStart, end: lastSunny + SUNNY_HOURS_STEP });
                    rangeStart = null;
                    lastSunny = null;
                }
            }
        }
        if (rangeStart !== null && lastSunny !== null) {
            rawRanges.push({ start: rangeStart, end: lastSunny + SUNNY_HOURS_STEP });
        }

        // Clip to opening hours for the selected day
        const place = placesRef.current.find((p) => p.id === selectedPlaceId);
        const openIntervals = getOpenIntervalsForDay(place?.openingHours, today.getDay());

        let clippedRanges: MinuteRange[];
        if (openIntervals === null) {
            // No opening hours data — show all sunny windows
            clippedRanges = rawRanges;
        } else {
            clippedRanges = rawRanges.flatMap((sunny) =>
                openIntervals
                    .map((open) => ({
                        start: Math.max(sunny.start, open.start),
                        end: Math.min(sunny.end, open.end),
                    }))
                    .filter((r) => r.end > r.start)
            );
        }

        setSelectedSunnyWindows(
            clippedRanges.map((r) => ({
                start: minutesToTimeString(r.start),
                end: minutesToTimeString(r.end),
            }))
        );
    }, [viewer, selectedPlaceId, pinTopHeights, explorerDate, setSelectedSunnyWindows]);

    // Selection change — hide/show underlying entity, rebuild overlay in primitive collection
    const prevSelectedIdRef = useRef<string | null | undefined>(null);
    useEffect(() => {
        if (!viewer) return;

        // Restore previously selected pin's underlying entity
        const prevId = prevSelectedIdRef.current;
        if (prevId) {
            const prev = viewer.entities.getById(ENTITY_IDS.placeBillboard(prevId));
            if (prev) prev.show = visible;
        }

        if (!selectedPlaceId) {
            syncOverlay(null, false);
            prevSelectedIdRef.current = null;
            return;
        }

        // Hide underlying entity — overlay primitive is the visual for the selected pin
        const underlying = viewer.entities.getById(ENTITY_IDS.placeBillboard(selectedPlaceId));
        if (underlying) underlying.show = false;

        syncOverlay(selectedPlaceId, visible);
        prevSelectedIdRef.current = selectedPlaceId;
    }, [viewer, selectedPlaceId, visible]);

    // Visibility toggle
    useEffect(() => {
        if (!viewer) return;
        managedIds.current.forEach((id) => {
            const billboard = viewer.entities.getById(ENTITY_IDS.placeBillboard(id));
            // keep selected pin's underlying entity hidden regardless of visible
            if (billboard) billboard.show = visible && id !== selectedIdRef.current;
            const line = viewer.entities.getById(ENTITY_IDS.placeLine(id));
            if (line) line.show = visible;
        });
        const collection = overlayCollectionRef.current;
        if (collection && !collection.isDestroyed()) collection.show = visible;
    }, [viewer, visible]);
};
