import { useEffect, useRef, useState } from "react";
import {
    Cartesian3,
    Viewer,
    sampleTerrainMostDetailed,
    Cartographic,
    VerticalOrigin,
} from "cesium";
import { useFilteredPlaces } from "./useFilteredPlaces";
import { useLayout, useMapState } from "@/features/explorer/components/MapContext";
import { MAX_CAMERA_DISTANCE, ENTITY_IDS } from "@/features/explorer/constants";
import { useLangNavigate } from "@/hooks/useLangNavigate";
import { useTranslation } from "react-i18next";

const PIN_FILL = "#5363a2"; // primary-600
const SELECTED_FILL = "#ff5a59"; // accent

function createPinImage(fillColor: string): HTMLCanvasElement {
    const r = 8;
    const lineW = 2;
    const lineH = 20;
    const pad = 1;
    const w = r * 2 + pad * 2;
    const h = r * 2 + lineH + pad * 2;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    const cx = w / 2;
    const cy = r + pad;
    // filled circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = fillColor;
    ctx.fill();
    // line below circle
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

const PIN_IMAGE = createPinImage(PIN_FILL);
const SELECTED_PIN_IMAGE = createPinImage(SELECTED_FILL);

export const usePins = (
    viewer: Viewer | null,
    visible: boolean,
    selectedPlaceId: string | null | undefined = null,
    offsetHeight: number = 20
) => {
    const { bounds, cameraDistance } = useMapState();
    const { topBarHeight } = useLayout();
    const navigate = useLangNavigate();
    const { i18n } = useTranslation();
    const { data: places } = useFilteredPlaces(bounds, {
        enabled: !!cameraDistance && cameraDistance <= MAX_CAMERA_DISTANCE,
        lang: i18n.language,
    });
    const [heights, setHeights] = useState<Record<string, number>>({});

    // Track which place IDs are currently managed and which height was applied per entity
    const managedIds = useRef<Set<string>>(new Set());
    const appliedHeights = useRef<Record<string, number>>({});

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

    // Fly to selected place, centering it in the visible area (between header and bottom nav)
    useEffect(() => {
        if (!viewer || !selectedPlaceId || !places?.length) return;

        const place = places.find((p) => p.id === selectedPlaceId);
        if (!place) return;

        const canvas = viewer.scene.canvas;
        const altitude = viewer.camera.positionCartographic.height;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fovY: number = (viewer.camera.frustum as any).fovy ?? Math.PI / 3;
        const metersPerPixel = (2 * altitude * Math.tan(fovY / 2)) / canvas.clientHeight;

        // Visual center is offset from screen center by half the difference of top/bottom UI
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

    // Sample terrain heights only for places we haven't sampled yet
    useEffect(() => {
        if (!viewer || !places?.length) return;

        const missing = places.filter((p) => heights[p.id] == null);
        if (!missing.length) return;

        let cancelled = false;

        const loadHeights = async () => {
            const cartographics = missing.map((p) =>
                Cartographic.fromDegrees(p.location.longitude, p.location.latitude)
            );
            const samples = await sampleTerrainMostDetailed(viewer.terrainProvider, cartographics);
            if (cancelled) return;
            setHeights((prev) => {
                const next = { ...prev };
                missing.forEach((p, i) => {
                    next[p.id] = (samples[i].height ?? 0) + offsetHeight;
                });
                return next;
            });
        };

        loadHeights().catch((err) =>
            console.error("Terrain sampling failed for places", { count: missing.length }, err)
        );
        return () => {
            cancelled = true;
        };
    }, [viewer, places, offsetHeight]);

    // Remove entities for places that left the visible set
    useEffect(() => {
        if (!viewer) return;
        const currentIds = new Set(places?.map((p) => p.id) ?? []);
        managedIds.current.forEach((id) => {
            if (!currentIds.has(id)) {
                const billboard = viewer.entities.getById(ENTITY_IDS.placeBillboard(id));
                if (billboard) viewer.entities.remove(billboard);
                managedIds.current.delete(id);
                delete appliedHeights.current[id];
            }
        });
    }, [viewer, places]);

    // Create entities or update position only when height changes — use static positions (no callbacks)
    useEffect(() => {
        if (!viewer || !places?.length) return;

        places.forEach((place) => {
            const terrainHeight = heights[place.id];
            if (terrainHeight == null) return;

            const { latitude, longitude } = place.location;
            const alreadyApplied = appliedHeights.current[place.id] === terrainHeight;

            const pinPos = Cartesian3.fromDegrees(longitude, latitude, terrainHeight);
            const image = place.id === selectedPlaceId ? SELECTED_PIN_IMAGE : PIN_IMAGE;

            const billboard = viewer.entities.getById(ENTITY_IDS.placeBillboard(place.id));
            if (!billboard) {
                viewer.entities.add({
                    id: ENTITY_IDS.placeBillboard(place.id),
                    show: visible,
                    position: pinPos,
                    billboard: {
                        image,
                        verticalOrigin: VerticalOrigin.BOTTOM,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    },
                });
            } else if (!alreadyApplied) {
                billboard.position = pinPos as never;
            }

            managedIds.current.add(place.id);
            appliedHeights.current[place.id] = terrainHeight;
        });
    }, [viewer, places, heights, offsetHeight, visible]);

    // Update pin image when selection changes
    useEffect(() => {
        if (!viewer) return;
        managedIds.current.forEach((id) => {
            const image = id === selectedPlaceId ? SELECTED_PIN_IMAGE : PIN_IMAGE;
            const billboard = viewer.entities.getById(ENTITY_IDS.placeBillboard(id));
            if (billboard?.billboard) billboard.billboard.image = image as never;
        });
    }, [viewer, selectedPlaceId]);

    // Toggle visibility without touching positions
    useEffect(() => {
        if (!viewer) return;
        managedIds.current.forEach((id) => {
            const billboard = viewer.entities.getById(ENTITY_IDS.placeBillboard(id));
            if (billboard) billboard.show = visible;
        });
    }, [viewer, visible]);
};
