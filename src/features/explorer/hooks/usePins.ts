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
    Color,
    ColorMaterialProperty,
} from "cesium";
import { useFilteredPlaces } from "./useFilteredPlaces";
import { useLayout, useMapState, useSunlit } from "@/features/explorer/state/mapStore";
import { MAX_CAMERA_DISTANCE, ENTITY_IDS } from "@/features/explorer/constants";
import { useLangNavigate } from "@/hooks/useLangNavigate";
import { useTranslation } from "react-i18next";

const PIN_HEAD_OFFSET = 3; // meters above surface (terrain or building roof)
const PIN_WIDTH = 18;
const PIN_HEIGHT = 38;

function createPinCanvas(fillColor: string): HTMLCanvasElement {
    const r = 8,
        lineW = 2,
        lineH = 20,
        pad = 1;
    const w = r * 2 + pad * 2;
    const h = r * 2 + lineH + pad * 2;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    const cx = w / 2,
        cy = r + pad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - lineW / 2, cy + r);
    ctx.lineTo(cx - lineW / 2, h - pad);
    ctx.lineTo(cx + lineW / 2, h - pad);
    ctx.lineTo(cx + lineW / 2, cy + r);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    return canvas;
}

const PIN_IMAGE = createPinCanvas("#5363a2");
const PIN_SUNLIT_IMAGE = createPinCanvas("#F2EBCF");
const SELECTED_PIN_IMAGE = createPinCanvas("#ff5a59");

const PIN_COLOR = Color.fromCssColorString("#5363a2");
const PIN_SUNLIT_COLOR = Color.fromCssColorString("#F2EBCF");
const SELECTED_COLOR = Color.fromCssColorString("#ff5a59");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEntity = any;

function setPolylineColor(line: AnyEntity, color: Color) {
    if (!line?.polyline) return;
    line.polyline.material = new ColorMaterialProperty(color);
    line.polyline.depthFailMaterial = new ColorMaterialProperty(color.withAlpha(0.4));
}

function setPolylinePositions(line: AnyEntity, positions: Cartesian3[]) {
    if (!line?.polyline) return;
    line.polyline.positions = positions;
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

    // Navigate on entity click
    useEffect(() => {
        if (!viewer) return;
        const handler = (entity: { id?: string } | undefined) => {
            if (!entity?.id) return;
            const prefix = ENTITY_IDS.placeBillboard("");
            if (entity.id.startsWith(prefix)) navigate(`/places/${entity.id.slice(prefix.length)}`);
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

    // Create/update billboard + stem entities
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
            const image = place.id === selectedPlaceId ? SELECTED_PIN_IMAGE : PIN_IMAGE;
            const stemColor = place.id === selectedPlaceId ? SELECTED_COLOR : PIN_COLOR;

            // Billboard (pin head)
            const billboard = viewer.entities.getById(ENTITY_IDS.placeBillboard(place.id));
            if (!billboard) {
                viewer.entities.add({
                    id: ENTITY_IDS.placeBillboard(place.id),
                    show: visible,
                    position: headPos,
                    billboard: {
                        image,
                        width: PIN_WIDTH,
                        height: PIN_HEIGHT,
                        verticalOrigin: VerticalOrigin.BOTTOM,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    },
                });
            } else if (!alreadyApplied) {
                billboard.position = headPos as never;
            }

            // Polyline stem (ground → pin head, visible through buildings via depthFailMaterial)
            const line = viewer.entities.getById(ENTITY_IDS.placeLine(place.id));
            if (!line) {
                viewer.entities.add({
                    id: ENTITY_IDS.placeLine(place.id),
                    show: visible,
                    polyline: {
                        positions: [groundPos, headPos],
                        width: 2,
                        material: new ColorMaterialProperty(stemColor),
                        depthFailMaterial: new ColorMaterialProperty(stemColor.withAlpha(0.4)),
                        clampToGround: false,
                    },
                });
            } else if (!alreadyApplied) {
                setPolylinePositions(line, [groundPos, headPos]);
            }

            managedIds.current.add(place.id);
            appliedPinTops.current[place.id] = pinTop;
            if (place.hasOutdoorSeating) outdoorSeatingIds.current.add(place.id);
            groundPositions.current[place.id] = groundPos;
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
            const color = isLit ? PIN_SUNLIT_COLOR : PIN_COLOR;
            const billboard = viewer.entities.getById(ENTITY_IDS.placeBillboard(id));
            if (billboard?.billboard)
                billboard.billboard.image = (isLit ? PIN_SUNLIT_IMAGE : PIN_IMAGE) as never;
            const line = viewer.entities.getById(ENTITY_IDS.placeLine(id));
            setPolylineColor(line, color);
        });
        setSunlitIds(
            new Set([...sunlitIds.current].filter((id) => outdoorSeatingIds.current.has(id)))
        );
    }, [viewer, sunTime, pinTopHeights, setSunlitIds]);

    // Selection change — update image and stem color
    useEffect(() => {
        if (!viewer) return;
        managedIds.current.forEach((id) => {
            const billboard = viewer.entities.getById(ENTITY_IDS.placeBillboard(id));
            const line = viewer.entities.getById(ENTITY_IDS.placeLine(id));
            if (id === selectedPlaceId) {
                if (billboard?.billboard) billboard.billboard.image = SELECTED_PIN_IMAGE as never;
                setPolylineColor(line, SELECTED_COLOR);
            } else {
                const isLit = sunlitIds.current.has(id) && outdoorSeatingIds.current.has(id);
                const color = isLit ? PIN_SUNLIT_COLOR : PIN_COLOR;
                if (billboard?.billboard)
                    billboard.billboard.image = (isLit ? PIN_SUNLIT_IMAGE : PIN_IMAGE) as never;
                setPolylineColor(line, color);
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
