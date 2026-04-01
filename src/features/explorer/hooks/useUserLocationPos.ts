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
import type { LatLng } from "../../../types/LatLng";
import { ENTITY_IDS } from "../constants";

const PIN_LIGHT_COLOR = Color.fromCssColorString("#F2EACF");
const PIN_DARK_COLOR = Color.fromCssColorString("#dbd0ab");

export const useUserLocationPos = (
    viewer: Viewer | null,
    geolocation: LatLng | null,
    visible: boolean,
    offsetHeight: number = 20
) => {
    const [terrainHeight, setTerrainHeight] = useState<number | null>(null);

    // Sample terrain height at the user's location
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
            if (!cancelled) setTerrainHeight((sample.height ?? 0) + offsetHeight);
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
    }, [viewer, geolocation, visible, offsetHeight]);

    useEffect(() => {
        if (!viewer || !geolocation || terrainHeight === null) return;

        const spherePos = new CallbackPositionProperty(
            () =>
                Cartesian3.fromDegrees(geolocation.longitude, geolocation.latitude, terrainHeight),
            false,
            ReferenceFrame.FIXED
        );

        const linePos = new CallbackProperty(
            () => [
                Cartesian3.fromDegrees(
                    geolocation.longitude,
                    geolocation.latitude,
                    terrainHeight - offsetHeight
                ),
                Cartesian3.fromDegrees(geolocation.longitude, geolocation.latitude, terrainHeight),
            ],
            false
        );

        let sphere = viewer.entities.getById(ENTITY_IDS.locationSphere);
        if (!sphere) {
            sphere = viewer.entities.add({
                id: ENTITY_IDS.locationSphere,
                position: spherePos,
                point: {
                    pixelSize: 14,
                    color: PIN_LIGHT_COLOR,
                    outlineColor: PIN_DARK_COLOR,
                    outlineWidth: 2,
                },
            });
        } else {
            sphere.position = spherePos;
        }

        let line = viewer.entities.getById(ENTITY_IDS.locationLine);
        if (!line) {
            line = viewer.entities.add({
                id: ENTITY_IDS.locationLine,
                polyline: {
                    positions: linePos,
                    width: 2,
                    material: PIN_DARK_COLOR,
                },
            });
        } else {
            line.polyline!.positions = linePos;
        }

        return () => {
            if (sphere) viewer.entities.remove(sphere);
            if (line) viewer.entities.remove(line);
        };
    }, [viewer, geolocation, terrainHeight, offsetHeight]);
};
