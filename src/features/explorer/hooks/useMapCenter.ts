import { Cartesian2, Cartographic, Math as CesiumMath, Viewer } from "cesium";
import { useEffect } from "react";
import { useMapState } from "../components/MapContext";

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
        latitude: CesiumMath.toDegrees(cartographic.latitude),
        longitude: CesiumMath.toDegrees(cartographic.longitude),
        height: cartographic.height,
    };
}

const useMapCenter = (viewer: Viewer | null) => {
    const { setCenter } = useMapState();

    useEffect(() => {
        if (!viewer) return;

        const removeListener = viewer.camera.changed.addEventListener(() => {
            const center = getMapCenter(viewer);
            if (center) setCenter(center);
        });

        return () => removeListener();
    }, [viewer, setCenter]);
};

export { useMapCenter };
