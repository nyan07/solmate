import React, { useEffect, useRef, useState } from "react";
import {
    Viewer,
    createWorldTerrainAsync,
    createOsmBuildingsAsync,
    Cartesian3,
    Color,
    DirectionalLight,
    Ion,
    UrlTemplateImageryProvider,
} from "cesium";

import "cesium/Build/Cesium/Widgets/widgets.css";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useMapCenter } from "@/features/explorer/hooks/useMapCenter";
import ExplorerHeader from "./ExplorerHeader";
import { useLayout, useMapState } from "./MapContext";
import { useSunTimes } from "@/features/explorer/hooks/useSunTimes";
import { useSunDirection } from "@/features/explorer/hooks/useSunDirection";
import { useUserLocationPos } from "@/features/explorer/hooks/useUserLocationPos";
import { useCameraDistance } from "@/features/explorer/hooks/useCameraDistance";
import type { LatLng } from "@/types/LatLng";
import { usePins } from "@/features/explorer/hooks/usePins";
import { DEFAULT_CAMERA_DISTANCE } from "@/features/explorer/constants";

Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION;

const FALLBACK_LOCATION: LatLng = { latitude: 52.5195605, longitude: 13.3988917 }; // Berlin

const ExplorerView: React.FC = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<Viewer | null>(null);
    const topBarRef = useRef<HTMLDivElement>(null);

    const [date, setDate] = useState<Date>(new Date());
    const [hour, setHour] = useState<number>(new Date().getHours());
    const [viewerReady, setViewerReady] = useState(false);
    const [showControls, setShowControls] = useState(false);

    const { setTopBarHeight } = useLayout();
    const { center: mapCenter } = useMapState();

    const {
        geolocation,
        error: geolocationError,
        loading: isGeolocationLoading,
    } = useGeolocation();
    useMapCenter(viewerRef.current);
    const cameraDistance = useCameraDistance(viewerRef.current);
    const sunTimes = useSunTimes(date, mapCenter);

    const sunData = useSunDirection(date, hour, geolocation);
    useUserLocationPos(viewerRef.current, geolocation, showControls);
    usePins(viewerRef.current, showControls);

    useEffect(() => {
        if (cameraDistance) {
            setShowControls(cameraDistance <= DEFAULT_CAMERA_DISTANCE + 10);
        }
    }, [cameraDistance]);

    useEffect(() => {
        if (!topBarRef.current) return;
        const observer = new ResizeObserver(([entry]) => setTopBarHeight(entry.contentRect.height));
        observer.observe(topBarRef.current);
        return () => observer.disconnect();
    }, []);

    // Initialize Cesium viewer
    useEffect(() => {
        if (isGeolocationLoading && !viewerReady) return;
        let viewer: Viewer;

        const initViewer = async () => {
            const terrain = await createWorldTerrainAsync();
            viewer = new Viewer(mapRef.current!, {
                terrainProvider: terrain,
                baseLayerPicker: false,
                timeline: false,
                animation: false,
                geocoder: false,
                homeButton: false,
                sceneModePicker: false,
                navigationHelpButton: false,
                fullscreenButton: false,
                selectionIndicator: false,
                shadows: true,
            });

            const osmLayer = new UrlTemplateImageryProvider({
                url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png?layers=V",
            });
            viewer.imageryLayers.addImageryProvider(osmLayer);

            const osmBuildings = await createOsmBuildingsAsync();
            osmBuildings.shadows = 2;
            viewer.scene.primitives.add(osmBuildings);

            viewer.shadows = true;
            viewer.scene.shadowMap.enabled = true;
            viewer.scene.shadowMap.softShadows = true;
            viewer.scene.globe.enableLighting = true;

            viewerRef.current = viewer;
            viewer.scene.preRender.addEventListener(preRenderHandler);
        };

        const preRenderHandler = () => {
            const initialPos = geolocation || FALLBACK_LOCATION;
            if (!viewerReady) {
                viewer.camera.flyTo({
                    destination: Cartesian3.fromDegrees(
                        initialPos.longitude,
                        initialPos.latitude,
                        DEFAULT_CAMERA_DISTANCE
                    ),
                    duration: 2,
                });
                setViewerReady(true);
                viewer.scene.preRender.removeEventListener(preRenderHandler);
            }
        };

        initViewer();

        return () => {
            viewer?.scene?.preRender.removeEventListener(preRenderHandler);
        };
    }, [geolocation, geolocationError, isGeolocationLoading]);

    // Update sun direction and lighting
    useEffect(() => {
        const viewer = viewerRef.current;
        if (!viewer || !viewerReady || !sunData) return;

        if (!viewer.scene.light) {
            viewer.scene.light = new DirectionalLight({
                direction: sunData.direction,
                color: Color.WHITE,
            });
        } else {
            (viewer.scene.light as DirectionalLight).direction = sunData.direction;
        }

        const controller = viewer.scene.screenSpaceCameraController;
        controller.enableZoom = true;
        controller.enableRotate = true;
        controller.enableTilt = false;
        controller.enableLook = false;

        viewer.clock.currentTime = sunData.time;
    }, [sunData, viewerReady]);

    return (
        <div style={{ width: "100%", height: "100vh" }}>
            <ExplorerHeader
                ref={topBarRef}
                visible={showControls}
                date={date}
                onDateChange={setDate}
                hour={hour}
                onHourChange={setHour}
                sunTimes={sunTimes}
            />

            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
        </div>
    );
};

export default ExplorerView;
