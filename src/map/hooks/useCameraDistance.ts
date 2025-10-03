import { Viewer } from "cesium";
import { useEffect } from "react";
import { useMapContext } from "../MapContext";


const useCameraDistance = (viewer: Viewer | null) => {
    const { cameraDistance, setCameraDistance } = useMapContext();

    useEffect(() => {
        if (!viewer) return;

        const cameraDistanceHandler = () => {
            if (!viewer) return;
            const carto = viewer.camera.positionCartographic;
            setCameraDistance(carto.height);
        };

        viewer.scene.postRender.addEventListener(cameraDistanceHandler);

        return () => {
            viewer?.scene?.postRender.removeEventListener(cameraDistanceHandler);
        };
    }, [viewer]);

    return cameraDistance;
}

export { useCameraDistance };
