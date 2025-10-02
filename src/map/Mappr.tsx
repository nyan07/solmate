import React, { useEffect, useRef, useState } from "react";
import {
  Viewer,
  IonImageryProvider,
  createWorldTerrainAsync,
  createOsmBuildingsAsync,
  Cartesian3,
  Color,
  DirectionalLight,
  Ion
} from "cesium";

import "cesium/Build/Cesium/Widgets/widgets.css";
import { useGeolocation } from "../hooks/useGeolocation";
import { FiSunset, FiSunrise } from "react-icons/fi";
import { DatePicker } from "../components/DatePicker";
import { Range } from "../components/Range";
import { useMapCenter } from "./hooks/useMapCenter";
import { useSunTimes } from "./hooks/useSunTimes";
import { useSunDirection } from "./hooks/useSunDirection";
import { roundToHalfHour } from "../utils/roundToHalfHour";

Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION;

const Mappr: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);

  const { geolocation } = useGeolocation();
  const [viewerReady, setViewerReady] = useState(false);

  const [date, setDate] = useState<Date>(new Date());
  const [hour, setHour] = useState<number>(new Date().getHours());
  const mapCenter = useMapCenter(viewerRef.current);
  const sunTimes = useSunTimes(date, mapCenter);

  const [showControls, setShowControls] = useState(false);

  const sunriseValue = sunTimes ? roundToHalfHour(sunTimes.sunrise, "up") : 6;
  const sunsetValue = sunTimes ? roundToHalfHour(sunTimes.sunset, "down") : 18;

  const CAMERA_DISTANCE = 800;

  useEffect(() => {
    if (!geolocation && !viewerReady) return;
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
        shadows: true
      });

      const imagery = await IonImageryProvider.fromAssetId(2);
      viewer.imageryLayers.addImageryProvider(imagery);

      const osmBuildings = await createOsmBuildingsAsync();
      osmBuildings.shadows = 2;
      viewer.scene.primitives.add(osmBuildings);

      viewer.shadows = true;
      viewer.scene.shadowMap.enabled = true;
      viewer.scene.shadowMap.softShadows = true;
      viewer.scene.globe.enableLighting = true;

      viewerRef.current = viewer;
      viewer.scene.preRender.addEventListener(preRenderHandler);
      viewer.scene.postRender.addEventListener(cameraDistanceHandler);
    };

    const preRenderHandler = () => {
      if (geolocation && !viewerReady) {
        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(
            geolocation.lng,
            geolocation.lat,
            CAMERA_DISTANCE
          ),
          duration: 2
        });
        setViewerReady(true);
        viewer.scene.preRender.removeEventListener(preRenderHandler);
      }
    };

    const cameraDistanceHandler = () => {
      if (!viewer) return;
      const carto = viewer.camera.positionCartographic;
      const height = carto.height;
      setShowControls(height <= CAMERA_DISTANCE + 10);
    };

    initViewer();

    return () => {
      viewer?.scene?.preRender.removeEventListener(preRenderHandler);
      viewer?.scene?.postRender.removeEventListener(cameraDistanceHandler);
    };
  }, [geolocation]);

  const sunData = useSunDirection(date, hour, geolocation);

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

    viewer.clock.currentTime = sunData.time;
  }, [sunData, viewerReady]);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <div
        className={`absolute top-0 left-0 right-0 z-50 transform transition-transform duration-500 ${showControls ? "translate-y-0" : "-translate-y-full"
          }`}
      >
        <div className="p-6 bg-neutral-lightest shadow-md rounded-b-xl flex flex-col gap-4 items-center">
          <div className="flex gap-4 items-center w-full">
            <DatePicker value={date} onChange={setDate} />
            <FiSunrise className="text-primary" />
            <Range
              min={sunriseValue}
              max={sunsetValue}
              step={0.5}
              value={hour}
              onChange={(value) => setHour(value)}
            />

            <FiSunset className="text-primary" />
            <span className="w-16 text-center py-2 rounded-xl bg-primary/20">
              {Math.floor(hour)}:{hour % 1 === 0 ? "00" : "30"}
            </span>
          </div>
        </div>
      </div>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default Mappr;
