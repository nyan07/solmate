import { Viewer } from "cesium";
import { useEffect } from "react";
import { useMapState } from "../components/MapContext";

const useCameraDistance = (viewer: Viewer | null) => {
    const { cameraDistance, setCameraDistance } = useMapState();

    useEffect(() => {
        if (!viewer) return;

        const cameraDistanceHandler = () => {
            const carto = viewer.camera.positionCartographic;
            setCameraDistance(carto.height);
        };

        viewer.scene.postRender.addEventListener(cameraDistanceHandler);

        return () => {
            viewer?.scene?.postRender.removeEventListener(cameraDistanceHandler);
        };
    }, [viewer]);

    return cameraDistance;
};

export { useCameraDistance };
