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
} from "cesium";
import type { LatLng } from "@/types/LatLng";
import { ENTITY_IDS } from "@/features/explorer/constants";

const DOT_COLOR = Color.fromCssColorString("#4285F4");
const DOT_OUTLINE = Color.WHITE;
const ACCURACY_COLOR = Color.fromCssColorString("#4285F4").withAlpha(0.15);
const ACCURACY_BORDER = Color.fromCssColorString("#4285F4").withAlpha(0.4);

export const useUserLocationPos = (
    viewer: Viewer | null,
    geolocation: LatLng | null,
    visible: boolean
) => {
    const [terrainHeight, setTerrainHeight] = useState<number | null>(null);

    useEffect(() => {
        if (!viewer || !geolocation || !visible) return;

        let cancelled = false;

        const loadHeight = async () => {
            const cartographic = Cartographic.fromDegrees(
                geolocation.longitude,
                geolocation.latitude
            );
            const [sample] = await sampleTerrainMostDetailed(viewer.terrainProvider, [
                cartographic,
            ]);
            if (!cancelled) setTerrainHeight(sample.height ?? 0);
        };

        loadHeight().catch((err) =>
            console.error(
                "Terrain sampling failed for user location",
                { lat: geolocation.latitude, lng: geolocation.longitude },
                err
            )
        );
        return () => {
            cancelled = true;
        };
    }, [viewer, geolocation, visible]);

    useEffect(() => {
        if (!viewer || !geolocation || terrainHeight === null) return;

        const groundPos = new CallbackPositionProperty(
            () =>
                Cartesian3.fromDegrees(
                    geolocation.longitude,
                    geolocation.latitude,
                    terrainHeight + 1
                ),
            false,
            ReferenceFrame.FIXED
        );

        const ellipseCenter = new CallbackProperty(
            () =>
                Cartesian3.fromDegrees(
                    geolocation.longitude,
                    geolocation.latitude,
                    terrainHeight + 0.5
                ),
            false
        );

        let dot = viewer.entities.getById(ENTITY_IDS.locationSphere);
        if (!dot) {
            dot = viewer.entities.add({
                id: ENTITY_IDS.locationSphere,
                position: groundPos,
                point: {
                    pixelSize: 16,
                    color: DOT_COLOR,
                    outlineColor: DOT_OUTLINE,
                    outlineWidth: 3,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                },
            });
        } else {
            dot.position = groundPos;
        }

        let accuracy = viewer.entities.getById(ENTITY_IDS.locationLine);
        if (!accuracy) {
            accuracy = viewer.entities.add({
                id: ENTITY_IDS.locationLine,
                position: ellipseCenter as never,
                ellipse: {
                    semiMajorAxis: new CallbackProperty(() => 20, false),
                    semiMinorAxis: new CallbackProperty(() => 20, false),
                    material: ACCURACY_COLOR,
                    outline: true,
                    outlineColor: ACCURACY_BORDER,
                    outlineWidth: 1,
                    height: terrainHeight + 0.5,
                },
            });
        } else {
            accuracy.position = ellipseCenter as never;
        }

        return () => {
            if (dot) viewer.entities.remove(dot);
            if (accuracy) viewer.entities.remove(accuracy);
        };
    }, [viewer, geolocation, terrainHeight]);
};
