import { Cartesian2, Cartographic, Math as CesiumMath, Viewer } from "cesium";
import { useEffect } from "react";
import { useMapState, useLayout } from "@/features/explorer/components/MapContext";
import type { Bounds } from "@/types/Bounds";

function pickLatLng(viewer: Viewer, x: number, y: number) {
    const ray = viewer.scene.camera.getPickRay(new Cartesian2(x, y));
    if (!ray) return null;
    const pos = viewer.scene.globe.pick(ray, viewer.scene);
    if (!pos) return null;
    const carto = Cartographic.fromCartesian(pos);
    return {
        latitude: CesiumMath.toDegrees(carto.latitude),
        longitude: CesiumMath.toDegrees(carto.longitude),
    };
}

function getVisibleArea(viewer: Viewer, topOffset: number, bottomOffset: number) {
    const w = viewer.scene.canvas.clientWidth;
    const h = viewer.scene.canvas.clientHeight;
    const top = topOffset;
    const bottom = h - bottomOffset;
    const midX = w / 2;
    const midY = top + (bottom - top) / 2;

    const center = pickLatLng(viewer, midX, midY);

    const hits = [
        pickLatLng(viewer, 0, top),
        pickLatLng(viewer, w, top),
        pickLatLng(viewer, 0, bottom),
        pickLatLng(viewer, w, bottom),
        // mid-edge samples as fallback when corners miss (tilted/horizon views)
        pickLatLng(viewer, midX, top),
        pickLatLng(viewer, midX, bottom),
        pickLatLng(viewer, 0, midY),
        pickLatLng(viewer, w, midY),
        center,
    ].filter(Boolean) as { latitude: number; longitude: number }[];

    const bounds: Bounds | null =
        hits.length >= 2
            ? {
                  north: Math.max(...hits.map((c) => c.latitude)),
                  south: Math.min(...hits.map((c) => c.latitude)),
                  east: Math.max(...hits.map((c) => c.longitude)),
                  west: Math.min(...hits.map((c) => c.longitude)),
              }
            : null;

    return { center, bounds };
}

const useMapCenter = (viewer: Viewer | null) => {
    const { setCenter, setBounds } = useMapState();
    const { topBarHeight } = useLayout();

    useEffect(() => {
        if (!viewer) return;

        const update = () => {
            const { center, bounds } = getVisibleArea(viewer, topBarHeight, 64);
            if (center) setCenter(center);
            if (bounds) setBounds(bounds);
        };

        // Fire immediately so bounds are set before the user moves the camera
        const removeOnce = viewer.scene.postRender.addEventListener(() => {
            update();
            removeOnce();
        });

        const removeListener = viewer.camera.changed.addEventListener(update);

        return () => {
            removeOnce();
            removeListener();
        };
    }, [viewer, setCenter, setBounds, topBarHeight]);
};

export { useMapCenter };
