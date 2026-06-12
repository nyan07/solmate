import React, { useCallback, useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";

import "cesium/Build/Cesium/Widgets/widgets.css";
import { BsCrosshair, BsSliders } from "react-icons/bs";
import { useTranslation } from "react-i18next";
import Button from "@/components/Button";
import { useMatch } from "react-router-dom";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useMapCenter } from "@/features/explorer/hooks/useMapCenter";
import ExplorerHeader from "./ExplorerHeader";
import {
    useFilters,
    useLayout,
    useMapState,
    useSelectedSunnyWindows,
} from "@/features/explorer/state/mapStore";
import { useClickOutside } from "@/hooks/useClickOutside";
import { ExplorerFilter } from "./ExplorerFilter";
import { useSunTimes } from "@/features/explorer/hooks/useSunTimes";
import { useSunDirection } from "@/features/explorer/hooks/useSunDirection";
import { useUserLocationPos } from "@/features/explorer/hooks/useUserLocationPos";
import { useCameraDistance } from "@/features/explorer/hooks/useCameraDistance";
import type { LatLng } from "@/types/LatLng";
import { usePins } from "@/features/explorer/hooks/usePins";
import {
    DEFAULT_CAMERA_DISTANCE,
    MAX_CAMERA_DISTANCE,
    MIN_CAMERA_DISTANCE,
} from "@/features/explorer/constants";
import { trackEvent } from "@/utils/analytics";

Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION;

const FALLBACK_LOCATION: LatLng = { latitude: 52.5195605, longitude: 13.3988917 }; // Berlin

type ExplorerViewProps = {
    onReady?: () => void;
};

const ExplorerView: React.FC<ExplorerViewProps> = ({ onReady }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<Cesium.Viewer | null>(null);
    const topBarRef = useRef<HTMLDivElement>(null);

    const [date, setDate] = useState<Date>(new Date());
    const [hour, setHour] = useState<number>(new Date().getHours());
    const [viewerReady, setViewerReady] = useState(false);

    const { setTopBarHeight, topBarHeight } = useLayout();
    const { center: mapCenter, cameraDistance } = useMapState();
    const { setExplorerDate } = useSelectedSunnyWindows();

    const [filterOpen, setFilterOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);
    useClickOutside(
        filterRef,
        useCallback(() => setFilterOpen(false), []),
        filterOpen
    );
    const { filters } = useFilters();
    const activeCount =
        Number(filters.openOnly) + Number(filters.outdoorSeatingOnly) + Number(filters.sunnyOnly);

    const { t } = useTranslation();
    const {
        geolocation,
        error: geolocationError,
        loading: isGeolocationLoading,
    } = useGeolocation();
    useMapCenter(viewerRef.current);
    useCameraDistance(viewerRef.current);
    const sunTimes = useSunTimes(date, mapCenter);

    const sunData = useSunDirection(date, hour, geolocation);
    useUserLocationPos(viewerRef.current, geolocation, true);
    const placeMatch = useMatch("/:lang/places/:placeId");
    usePins(viewerRef.current, true, placeMatch?.params?.placeId, sunData?.time ?? null);

    useEffect(() => {
        if (!topBarRef.current) return;
        const observer = new ResizeObserver(([entry]) => setTopBarHeight(entry.contentRect.height));
        observer.observe(topBarRef.current);
        return () => observer.disconnect();
    }, []);

    // Initialize Cesium viewer
    useEffect(() => {
        if (isGeolocationLoading && !viewerReady) return;
        let viewer: Cesium.Viewer;

        const initViewer = async () => {
            const terrain = await Cesium.createWorldTerrainAsync();
            viewer = new Cesium.Viewer(mapRef.current!, {
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
                infoBox: false,
                shadows: true,
            });

            const osmLayer = new Cesium.UrlTemplateImageryProvider({
                url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png?layers=V",
            });
            viewer.imageryLayers.addImageryProvider(osmLayer);

            const osmBuildings = await Cesium.createOsmBuildingsAsync({
                showOutline: false,
            });

            osmBuildings.shadows = 2;
            osmBuildings.style = new Cesium.Cesium3DTileStyle({
                color: "color('#f7eae3')",
            });

            osmBuildings.maximumScreenSpaceError = 4;

            viewer.scene.primitives.add(osmBuildings);

            viewer.shadows = true;
            viewer.scene.shadowMap.enabled = true;
            viewer.scene.shadowMap.softShadows = true;
            viewer.scene.globe.enableLighting = true;

            viewer.scene.screenSpaceCameraController.maximumZoomDistance = MAX_CAMERA_DISTANCE;
            viewer.scene.screenSpaceCameraController.minimumZoomDistance = MIN_CAMERA_DISTANCE;

            viewerRef.current = viewer;
            viewer.scene.preRender.addEventListener(preRenderHandler);
        };

        const preRenderHandler = () => {
            const initialPos = geolocation || FALLBACK_LOCATION;
            if (!viewerReady) {
                viewer.camera.setView({
                    destination: Cesium.Cartesian3.fromDegrees(
                        initialPos.longitude,
                        initialPos.latitude,
                        DEFAULT_CAMERA_DISTANCE
                    ),
                });
                setViewerReady(true);
                viewer.scene.preRender.removeEventListener(preRenderHandler);
                // Wait for the first frame at the correct position to be fully drawn
                const onFirstFrame = () => {
                    viewer.scene.postRender.removeEventListener(onFirstFrame);
                    onReady?.();
                };
                viewer.scene.postRender.addEventListener(onFirstFrame);
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
            viewer.scene.light = new Cesium.DirectionalLight({
                direction: sunData.direction,
                color: Cesium.Color.WHITE,
            });
        } else {
            (viewer.scene.light as Cesium.DirectionalLight).direction = sunData.direction;
        }

        const controller = viewer.scene.screenSpaceCameraController;
        controller.enableZoom = true;
        controller.enableRotate = true;
        controller.enableTilt = false;
        controller.enableLook = false;

        viewer.clock.currentTime = sunData.time;
    }, [sunData, viewerReady]);

    // Center-based wheel zoom — disable Cesium's default wheel zoom here so it's always off
    useEffect(() => {
        const viewer = viewerRef.current;
        if (!viewer || !viewerReady) return;

        viewer.scene.screenSpaceCameraController.zoomEventTypes = [Cesium.CameraEventType.PINCH];

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const height = viewer.camera.positionCartographic.height;
            const amount = Math.abs(e.deltaY) * height * 0.001;
            if (e.deltaY < 0) {
                if (height - amount >= MIN_CAMERA_DISTANCE) viewer.camera.zoomIn(amount);
            } else {
                viewer.camera.zoomOut(Math.min(amount, MAX_CAMERA_DISTANCE - height));
            }
        };

        viewer.canvas.addEventListener("wheel", handleWheel, { passive: false });
        return () => viewer.canvas.removeEventListener("wheel", handleWheel);
    }, [viewerReady]);

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <ExplorerHeader
                ref={topBarRef}
                date={date}
                onDateChange={(d) => {
                    trackEvent("date_changed", { date: d.toISOString().slice(0, 10) });
                    setDate(d);
                    setExplorerDate(d);
                }}
                hour={hour}
                onHourChange={setHour}
                onHourChangeCommit={(h) => trackEvent("time_slider_changed", { hour: h })}
                sunTimes={sunTimes}
            />

            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

            {cameraDistance !== null && cameraDistance >= MAX_CAMERA_DISTANCE && (
                <div className="absolute bottom-24 left-1/2 z-30 -translate-x-1/2 pointer-events-none">
                    <div className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-primary-800 shadow-md backdrop-blur-sm whitespace-nowrap">
                        {t("placeList.zoomedOut.title")}
                    </div>
                </div>
            )}

            <div
                className="absolute right-2 z-30 flex flex-col gap-1.5"
                style={{ top: topBarHeight + 8 }}
            >
                <div className="relative" ref={filterRef}>
                    <Button
                        leadingIcon={<BsSliders />}
                        label={t("explorer.filterToggle")}
                        selected={filterOpen}
                        onClick={() => setFilterOpen((o) => !o)}
                        variant="ghost"
                    />
                    {activeCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent pointer-events-none" />
                    )}
                    {filterOpen && <ExplorerFilter />}
                </div>
                {geolocation && (
                    <Button
                        leadingIcon={<BsCrosshair />}
                        label={t("explorer.recenter")}
                        variant="ghost"
                        onClick={() => {
                            trackEvent("map_recentered");
                            viewerRef.current?.camera.flyTo({
                                destination: Cesium.Cartesian3.fromDegrees(
                                    geolocation.longitude,
                                    geolocation.latitude,
                                    DEFAULT_CAMERA_DISTANCE
                                ),
                                duration: 1,
                            });
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default ExplorerView;
