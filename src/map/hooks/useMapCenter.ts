import { Cartesian2, Cartographic, Math as CesiumMath, Viewer } from "cesium";
import { useEffect } from "react";
import { useMapContext } from "../MapContext";

function getMapCenter(viewer: Viewer) {
    const scene = viewer.scene;
    const windowPosition = new Cartesian2(
        scene.canvas.clientWidth / 2,
        scene.canvas.clientHeight / 2
    );
    const pickRay = scene.camera.getPickRay(windowPosition);
    if (!pickRay) return null;

    const pickPosition = scene.globe.pick(pickRay, scene);
    if (!pickPosition) return null;

    const cartographic = Cartographic.fromCartesian(pickPosition);
    return {
        lat: CesiumMath.toDegrees(cartographic.latitude),
        lng: CesiumMath.toDegrees(cartographic.longitude),
        height: cartographic.height,
    };
}

const useMapCenter = (viewer: Viewer | null) => {
    const { center, setCenter } = useMapContext();

    useEffect(() => {
        if (!viewer) return;

        const handler = viewer.camera.changed.addEventListener(() => {
            const center = getMapCenter(viewer);
            if (center) {
                setCenter(center);
            }
        });

        return () => {
            handler();
        };
    }, [viewer]);

    return center;
}

export { useMapCenter };
