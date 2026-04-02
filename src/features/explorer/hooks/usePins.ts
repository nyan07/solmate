import { useEffect, useRef, useState } from "react";
import {
    Cartesian3,
    Color,
    Viewer,
    sampleTerrainMostDetailed,
    Cartographic,
    VerticalOrigin,
} from "cesium";
import { useFilteredPlaces } from "./useFilteredPlaces";
import { useMapState } from "@/features/explorer/components/MapContext";
import { DEFAULT_CAMERA_DISTANCE, ENTITY_IDS } from "@/features/explorer/constants";
import { useNavigate } from "react-router-dom";

const PIN_COLOR = Color.fromCssColorString("#8591b5");

export const usePins = (viewer: Viewer | null, visible: boolean, offsetHeight: number = 20) => {
    const { bounds, cameraDistance } = useMapState();
    const navigate = useNavigate();
    const { data: places } = useFilteredPlaces(bounds, {
        enabled: !!cameraDistance && cameraDistance <= DEFAULT_CAMERA_DISTANCE + 10,
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
                const line = viewer.entities.getById(ENTITY_IDS.placeLine(id));
                if (billboard) viewer.entities.remove(billboard);
                if (line) viewer.entities.remove(line);
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
            const linePositions = [
                Cartesian3.fromDegrees(longitude, latitude, terrainHeight - offsetHeight),
                Cartesian3.fromDegrees(longitude, latitude, terrainHeight),
            ];

            const billboard = viewer.entities.getById(ENTITY_IDS.placeBillboard(place.id));
            if (!billboard) {
                viewer.entities.add({
                    id: ENTITY_IDS.placeBillboard(place.id),
                    show: visible,
                    position: pinPos,
                    billboard: {
                        image: "/pin.png",
                        scale: 1,
                        verticalOrigin: VerticalOrigin.BOTTOM,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    },
                });
            } else if (!alreadyApplied) {
                billboard.position = pinPos as never;
            }

            const line = viewer.entities.getById(ENTITY_IDS.placeLine(place.id));
            if (!line) {
                viewer.entities.add({
                    id: ENTITY_IDS.placeLine(place.id),
                    show: visible,
                    polyline: {
                        positions: linePositions,
                        width: 3,
                        material: PIN_COLOR,
                    },
                });
            } else if (!alreadyApplied) {
                line.polyline!.positions = linePositions as never;
            }

            managedIds.current.add(place.id);
            appliedHeights.current[place.id] = terrainHeight;
        });
    }, [viewer, places, heights, offsetHeight, visible]);

    // Toggle visibility without touching positions
    useEffect(() => {
        if (!viewer) return;
        managedIds.current.forEach((id) => {
            const billboard = viewer.entities.getById(ENTITY_IDS.placeBillboard(id));
            const line = viewer.entities.getById(ENTITY_IDS.placeLine(id));
            if (billboard) billboard.show = visible;
            if (line) line.show = visible;
        });
    }, [viewer, visible]);
};
