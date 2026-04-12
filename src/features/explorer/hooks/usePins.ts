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
import { useFilteredPlaces } from "./useFilteredPlaces";
import { useLayout, useMapState, useSunlit } from "@/features/explorer/state/mapStore";
import { MAX_CAMERA_DISTANCE, ENTITY_IDS } from "@/features/explorer/constants";
import { useLangNavigate } from "@/hooks/useLangNavigate";
import { useTranslation } from "react-i18next";
import { trackEvent } from "@/utils/analytics";

const PIN_HEAD_OFFSET = 2; // meters above surface (terrain or building roof)
const PIN_DIAMETER = 24;
const PIN_CANVAS_SIZE = 32; // PIN_DIAMETER + 2px padding on each side
const PIN_ICON_SIZE = 16;

// Bootstrap Icon SVG paths (viewBox 0 0 16 16)
const BS_SUN_PATH =
    "M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708";
const BS_CLOUD_FILL_PATH =
    "M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383";

function createPinCanvas(
    fillColor: string,
    iconPath: string,
    iconColor: string,
    selected: boolean
): HTMLCanvasElement {
    const dpr = Math.ceil(window.devicePixelRatio ?? 1);
    const canvas = document.createElement("canvas");
    // Physical pixels for crisp rendering on retina displays;
    // billboard width/height stays at PIN_CANVAS_SIZE (logical px).
    canvas.width = PIN_CANVAS_SIZE * dpr;
    canvas.height = PIN_CANVAS_SIZE * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const cx = PIN_CANVAS_SIZE / 2;
    const cy = PIN_CANVAS_SIZE / 2;
    const r = PIN_DIAMETER / 2;

    // Circle background
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Dotted border overlapping the circle edge when selected
    if (selected) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.setLineDash([2, 2]);
        ctx.stroke();
    }

    // Icon scaled from 16×16 viewBox to PIN_ICON_SIZE×PIN_ICON_SIZE
    const scale = PIN_ICON_SIZE / 16;
    const iconX = cx - PIN_ICON_SIZE / 2;
    const iconY = cy - PIN_ICON_SIZE / 2;
    ctx.save();
    ctx.translate(iconX, iconY);
    ctx.scale(scale, scale);
    ctx.fillStyle = iconColor;
    ctx.fill(new Path2D(iconPath));
    ctx.restore();

    return canvas;
}

const PIN_SHADOW_IMAGE = createPinCanvas("#909CC2", BS_CLOUD_FILL_PATH, "#ffffff", false);
const PIN_SUN_IMAGE = createPinCanvas("#FF5959", BS_SUN_PATH, "#000000", false);
const SELECTED_SHADOW_IMAGE = createPinCanvas("#909CC2", BS_CLOUD_FILL_PATH, "#ffffff", true);
const SELECTED_SUN_IMAGE = createPinCanvas("#FF5959", BS_SUN_PATH, "#000000", true);

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

    // Navigate on entity click
    useEffect(() => {
        if (!viewer) return;
        const handler = (entity: { id?: string } | undefined) => {
            if (!entity?.id) return;
            const prefix = ENTITY_IDS.placeBillboard("");
            if (entity.id.startsWith(prefix)) {
                const placeId = entity.id.slice(prefix.length);
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

    // Create/update billboard entities
    useEffect(() => {
        if (!viewer || !places?.length) return;
        places.forEach((place) => {
            const terrain = terrainHeights[place.id];
            const pinTop = pinTopHeights[place.id];
            if (terrain == null || pinTop == null) return;

            const { latitude, longitude } = place.location;
            const alreadyApplied = appliedPinTops.current[place.id] === pinTop;
            const groundPos = Cartesian3.fromDegrees(longitude, latitude, terrain);
            const headPos = Cartesian3.fromDegrees(longitude, latitude, pinTop);

            // Billboard (circle pin)
            const billboard = viewer.entities.getById(ENTITY_IDS.placeBillboard(place.id));
            if (!billboard) {
                viewer.entities.add({
                    id: ENTITY_IDS.placeBillboard(place.id),
                    show: visible,
                    position: headPos,
                    billboard: {
                        image: PIN_SHADOW_IMAGE,
                        width: PIN_CANVAS_SIZE,
                        height: PIN_CANVAS_SIZE,
                        verticalOrigin: VerticalOrigin.CENTER,
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
        });
    }, [viewer, places, terrainHeights, pinTopHeights, visible]);

    // Shadow check — update billboard image and stem color
    useEffect(() => {
        if (!viewer || !sunTime) return;
        const sunDir = getSunDirectionECEF(sunTime);
        if (!sunDir) return;
        managedIds.current.forEach((id) => {
            if (id === selectedPlaceId) return;
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
            const billboard = viewer.entities.getById(ENTITY_IDS.placeBillboard(id));
            if (billboard?.billboard)
                billboard.billboard.image = (isLit ? PIN_SUN_IMAGE : PIN_SHADOW_IMAGE) as never;
        });
        setSunlitIds(
            new Set([...sunlitIds.current].filter((id) => outdoorSeatingIds.current.has(id)))
        );
    }, [viewer, sunTime, pinTopHeights, setSunlitIds]);

    // Selection change — update image and bring selected pin to front
    useEffect(() => {
        if (!viewer) return;
        managedIds.current.forEach((id) => {
            const billboard = viewer.entities.getById(ENTITY_IDS.placeBillboard(id));
            if (!billboard?.billboard) return;
            const isLit = sunlitIds.current.has(id) && outdoorSeatingIds.current.has(id);
            if (id === selectedPlaceId) {
                const image = isLit ? SELECTED_SUN_IMAGE : SELECTED_SHADOW_IMAGE;
                // Remove and re-add so it is last in the collection → drawn on top
                const headPos = headPositions.current[id];
                if (headPos) {
                    viewer.entities.remove(billboard);
                    viewer.entities.add({
                        id: ENTITY_IDS.placeBillboard(id),
                        show: billboard.show,
                        position: headPos,
                        billboard: {
                            image,
                            width: PIN_CANVAS_SIZE,
                            height: PIN_CANVAS_SIZE,
                            verticalOrigin: VerticalOrigin.CENTER,
                            disableDepthTestDistance: Number.POSITIVE_INFINITY,
                        },
                    });
                } else {
                    billboard.billboard.image = image as never;
                }
            } else {
                billboard.billboard.image = (isLit ? PIN_SUN_IMAGE : PIN_SHADOW_IMAGE) as never;
            }
        });
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
    }, [viewer, visible]);
};
