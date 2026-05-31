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
} from "cesium";
import pinSvgRaw from "@/assets/pin.svg?raw";
import cloudSvgRaw from "@/assets/cloud.svg?raw";
import sunSvgRaw from "@/assets/sun.svg?raw";
import { useFilteredPlaces } from "./useFilteredPlaces";
import { useLayout, useMapState, useSunlit } from "@/features/explorer/state/mapStore";
import { MAX_CAMERA_DISTANCE, ENTITY_IDS } from "@/features/explorer/constants";
import { useLangNavigate } from "@/hooks/useLangNavigate";
import { useTranslation } from "react-i18next";
import { trackEvent } from "@/utils/analytics";

const PIN_HEAD_OFFSET = 2; // meters above surface (terrain or building roof)
const ACCENT_COLOR = "#ff5a59";
const PIN_BG_COLOR = "#0D0A1A";
// Rendered billboard size in logical pixels — PAD gives room for the outline stroke
// PIN_H derived from PIN_W to preserve the path's natural 11:16 aspect ratio
const PIN_W = 36;
const PIN_H = Math.round((PIN_W * 16) / 11); // ~52
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
    const iconSize = 22;
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
    const sunlitIds = useRef<Set<string>>(new Set());
    const outdoorSeatingIds = useRef<Set<string>>(new Set());
    const groundPositions = useRef<Record<string, Cartesian3>>({});
    const headPositions = useRef<Record<string, Cartesian3>>({});
    const selectedIdRef = useRef<string | null | undefined>(null);
    selectedIdRef.current = selectedPlaceId;

    // Navigate on entity click
    useEffect(() => {
        if (!viewer) return;
        const handler = (entity: { id?: string } | undefined) => {
            if (!entity?.id) return;
            const prefix = ENTITY_IDS.placeBillboard("");
            let placeId: string | null = null;
            if (entity.id.startsWith(prefix)) {
                placeId = entity.id.slice(prefix.length);
            } else if (entity.id === ENTITY_IDS.selectedOverlay && selectedIdRef.current) {
                placeId = selectedIdRef.current;
            }
            if (placeId) {
                trackEvent("pin_clicked", { place_id: placeId });
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

    // Remove + re-add overlay so it is last in the collection (rendered on top)
    const liftOverlay = (v: Viewer, pos: Cartesian3, image: string, show: boolean) => {
        const existing = v.entities.getById(ENTITY_IDS.selectedOverlay);
        if (existing) v.entities.remove(existing);
        v.entities.add({
            id: ENTITY_IDS.selectedOverlay,
            show,
            position: pos as never,
            billboard: {
                image,
                width: BILL_W,
                height: BILL_H,
                verticalOrigin: VerticalOrigin.BOTTOM,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
        });
    };

    // Ref storing the last overlay state so we can re-lift it after new pins are added
    const overlayRef = useRef<{ pos: Cartesian3; image: string } | null>(null);

    // Create/update billboard entities
    useEffect(() => {
        if (!viewer || !places?.length) return;
        let addedCount = 0;
        places.forEach((place) => {
            const terrain = terrainHeights[place.id];
            const pinTop = pinTopHeights[place.id];
            if (terrain == null || pinTop == null) return;

            const { latitude, longitude } = place.location;
            const alreadyApplied = appliedPinTops.current[place.id] === pinTop;
            const groundPos = Cartesian3.fromDegrees(longitude, latitude, terrain);
            const headPos = Cartesian3.fromDegrees(longitude, latitude, pinTop);

            // Always store the unselected image — the overlay entity carries the selected style
            const billboard = viewer.entities.getById(ENTITY_IDS.placeBillboard(place.id));
            if (!billboard) {
                addedCount++;
                viewer.entities.add({
                    id: ENTITY_IDS.placeBillboard(place.id),
                    show: visible,
                    position: headPos,
                    billboard: {
                        image: PIN_SHADOW_IMAGE,
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
            if (place.hasOutdoorSeating) outdoorSeatingIds.current.add(place.id);
            groundPositions.current[place.id] = groundPos;
            headPositions.current[place.id] = headPos;

            // If this newly-placed pin is the selected one, hide it and set up the overlay
            if (place.id === selectedIdRef.current) {
                const justAdded = viewer.entities.getById(ENTITY_IDS.placeBillboard(place.id));
                if (justAdded) justAdded.show = false;
                if (!overlayRef.current) {
                    const isLit =
                        sunlitIds.current.has(place.id) && outdoorSeatingIds.current.has(place.id);
                    overlayRef.current = {
                        pos: headPos,
                        image: isLit ? SELECTED_SUN_IMAGE : SELECTED_SHADOW_IMAGE,
                    };
                }
            }
        });

        // Re-lift overlay only when new entities were added this run (keeps it last in collection)
        if (overlayRef.current && addedCount > 0) {
            liftOverlay(viewer, overlayRef.current.pos, overlayRef.current.image, visible);
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

            const isLit = inSunlight && outdoorSeatingIds.current.has(id);
            if (id === selectedPlaceId) {
                const headPos = headPositions.current[id];
                if (headPos && overlayRef.current) {
                    const image = isLit ? SELECTED_SUN_IMAGE : SELECTED_SHADOW_IMAGE;
                    overlayRef.current = { pos: headPos, image };
                    const overlay = viewer.entities.getById(ENTITY_IDS.selectedOverlay);
                    if (overlay?.billboard) overlay.billboard.image = image as never;
                }
            } else {
                const billboard = viewer.entities.getById(ENTITY_IDS.placeBillboard(id));
                if (billboard?.billboard)
                    billboard.billboard.image = (isLit ? PIN_SUN_IMAGE : PIN_SHADOW_IMAGE) as never;
            }
        });
        setSunlitIds(
            new Set([...sunlitIds.current].filter((id) => outdoorSeatingIds.current.has(id)))
        );
    }, [viewer, sunTime, pinTopHeights, setSunlitIds]);

    // Selection change — move overlay to new selected pin, hide/restore underlying entities
    const prevSelectedIdRef = useRef<string | null | undefined>(null);
    useEffect(() => {
        if (!viewer) return;

        // Restore the previously selected pin's underlying entity
        const prevId = prevSelectedIdRef.current;
        if (prevId) {
            const prev = viewer.entities.getById(ENTITY_IDS.placeBillboard(prevId));
            if (prev) prev.show = visible;
        }

        // Remove overlay when nothing is selected
        if (!selectedPlaceId) {
            const existing = viewer.entities.getById(ENTITY_IDS.selectedOverlay);
            if (existing) viewer.entities.remove(existing);
            overlayRef.current = null;
            prevSelectedIdRef.current = null;
            return;
        }

        const headPos = headPositions.current[selectedPlaceId];
        if (!headPos) {
            prevSelectedIdRef.current = selectedPlaceId;
            return;
        }

        // Hide the underlying entity — the overlay is the visual representation
        const underlying = viewer.entities.getById(ENTITY_IDS.placeBillboard(selectedPlaceId));
        if (underlying) underlying.show = false;

        const isLit =
            sunlitIds.current.has(selectedPlaceId) &&
            outdoorSeatingIds.current.has(selectedPlaceId);
        const image = isLit ? SELECTED_SUN_IMAGE : SELECTED_SHADOW_IMAGE;
        overlayRef.current = { pos: headPos, image };
        liftOverlay(viewer, headPos, image, visible);
        prevSelectedIdRef.current = selectedPlaceId;
    }, [viewer, selectedPlaceId]);

    // Visibility toggle
    useEffect(() => {
        if (!viewer) return;
        managedIds.current.forEach((id) => {
            const billboard = viewer.entities.getById(ENTITY_IDS.placeBillboard(id));
            if (billboard) billboard.show = visible;
            const line = viewer.entities.getById(ENTITY_IDS.placeLine(id));
            if (line) line.show = visible;
        });
        const overlay = viewer.entities.getById(ENTITY_IDS.selectedOverlay);
        if (overlay) overlay.show = visible;
    }, [viewer, visible]);
};
