import { useEffect, useState } from "react";
import {
    Cartesian3,
    Color,
    Viewer,
    CallbackPositionProperty,
    ReferenceFrame,
    sampleTerrainMostDetailed,
    Cartographic,
    CallbackProperty,
    VerticalOrigin,
} from "cesium";
import { useNearbyPlaces } from "./useNearbyPlaces";
import { useMapState } from "@/features/explorer/components/MapContext";
import { DEFAULT_CAMERA_DISTANCE, ENTITY_IDS } from "@/features/explorer/constants";
import { useNavigate } from "react-router-dom";

const PIN_COLOR = Color.fromCssColorString("#8591b5");

export const usePins = (viewer: Viewer | null, visible: boolean, offsetHeight: number = 20) => {
    const { center, cameraDistance } = useMapState();
    const navigate = useNavigate();
    const { data: places } = useNearbyPlaces(center, {
        enabled: !!cameraDistance && cameraDistance <= DEFAULT_CAMERA_DISTANCE + 10,
    });
    const [heights, setHeights] = useState<Record<string, number>>({});

    // Sample terrain height for each place so pins sit on the ground
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

    useEffect(() => {
        if (!viewer || !places?.length) return;

        let cancelled = false;

        const loadHeights = async () => {
            const cartographics = places.map((p) =>
                Cartographic.fromDegrees(p.location.longitude, p.location.latitude)
            );

            const samples = await sampleTerrainMostDetailed(viewer.terrainProvider, cartographics);

            if (cancelled) return;

            const mapped: Record<string, number> = {};
            places.forEach((p, i) => {
                mapped[p.id] = (samples[i].height ?? 0) + offsetHeight;
            });

            setHeights(mapped);
        };

        loadHeights().catch((err) =>
            console.error("Terrain sampling failed for places", { count: places.length }, err)
        );
        return () => {
            cancelled = true;
        };
    }, [viewer, places, offsetHeight]);

    // Create/update entities (not gated on visible — avoids destroy/recreate on zoom)
    useEffect(() => {
        if (!viewer || !places?.length) return;

        places.forEach((place) => {
            const terrainHeight = heights[place.id];
            if (terrainHeight == null) return;

            const { latitude, longitude } = place.location;

            const billboardPos = new CallbackPositionProperty(
                () => Cartesian3.fromDegrees(longitude, latitude, terrainHeight),
                false,
                ReferenceFrame.FIXED
            );

            const linePos = new CallbackProperty(
                () => [
                    Cartesian3.fromDegrees(longitude, latitude, terrainHeight - offsetHeight),
                    Cartesian3.fromDegrees(longitude, latitude, terrainHeight),
                ],
                false
            );

            let billboard = viewer.entities.getById(ENTITY_IDS.placeBillboard(place.id));
            if (!billboard) {
                billboard = viewer.entities.add({
                    id: ENTITY_IDS.placeBillboard(place.id),
                    show: visible,
                    position: billboardPos,
                    billboard: {
                        image: "/pin.png",
                        scale: 1,
                        verticalOrigin: VerticalOrigin.BOTTOM,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    },
                });
            } else {
                billboard.position = billboardPos;
            }

            let line = viewer.entities.getById(ENTITY_IDS.placeLine(place.id));
            if (!line) {
                line = viewer.entities.add({
                    id: ENTITY_IDS.placeLine(place.id),
                    show: visible,
                    polyline: {
                        positions: linePos,
                        width: 3,
                        material: PIN_COLOR,
                    },
                });
            } else {
                line.polyline!.positions = linePos;
            }
        });

        return () => {
            places.forEach((place) => {
                const billboard = viewer.entities.getById(ENTITY_IDS.placeBillboard(place.id));
                const line = viewer.entities.getById(ENTITY_IDS.placeLine(place.id));
                if (billboard) viewer.entities.remove(billboard);
                if (line) viewer.entities.remove(line);
            });
        };
    }, [viewer, places, heights, offsetHeight]);

    // Toggle visibility without destroying entities
    useEffect(() => {
        if (!viewer || !places?.length) return;
        places.forEach((place) => {
            const billboard = viewer.entities.getById(ENTITY_IDS.placeBillboard(place.id));
            const line = viewer.entities.getById(ENTITY_IDS.placeLine(place.id));
            if (billboard) billboard.show = visible;
            if (line) line.show = visible;
        });
    }, [viewer, places, visible]);
};
