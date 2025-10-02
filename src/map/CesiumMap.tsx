import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Viewer,
  IonImageryProvider,
  createWorldTerrainAsync,
  createOsmBuildingsAsync,
  Cartesian3,
  Color,
  DirectionalLight,
  JulianDate,
  Ion
} from "cesium";
import SunCalc from "suncalc";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { useGeolocation } from "../hooks/useGeolocation";
import { FiSunset, FiSunrise } from "react-icons/fi";
import { DatePicker } from "../components/DatePicker";
import { Range } from "../components/Range";

Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION;

const CesiumMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const { geoLocation } = useGeolocation({ active: true });

  const [viewerReady, setViewerReady] = useState(false);
  const [cameraCentered, setCameraCentered] = useState(false);

  const [date, setDate] = useState<Date>(new Date());
  const [hour, setHour] = useState<number>(new Date().getHours());

  // Inicializa o Cesium Viewer
  useEffect(() => {
    if (!mapRef.current || viewerRef.current) return;

    const initViewer = async () => {
      const terrain = await createWorldTerrainAsync();
      const viewer = new Viewer(mapRef.current!, {
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

      // Espera o scene e os OSM Buildings estarem prontos
      viewer.scene.preRender.addEventListener(function onPreRender() {
        if (geoLocation && !cameraCentered) {
          viewer.camera.setView({
            destination: Cartesian3.fromDegrees(
              geoLocation.lng,
              geoLocation.lat,
              800
            ),
          });
          setCameraCentered(true);
        }
      });

      setViewerReady(true);
    };

    initViewer();
  }, [geoLocation, cameraCentered]);

  // Calcular nascer/pôr do sol
  const sunTimes = useMemo(() => {
    if (!geoLocation) return null;
    return SunCalc.getTimes(date, geoLocation.lat, geoLocation.lng);
  }, [geoLocation, date]);

  const sunriseHour = sunTimes ? sunTimes.sunrise.getHours() : 6;
  const sunsetHour = sunTimes ? sunTimes.sunset.getHours() : 18;

  // Atualiza a direção do Sol e sombras quando a hora muda
  useEffect(() => {
    if (!viewerRef.current || !geoLocation) return;
    const viewer = viewerRef.current;

    const current = new Date(date);
    current.setHours(hour, 0, 0, 0);

    const sunPos = SunCalc.getPosition(current, geoLocation.lat, geoLocation.lng);
    const altitude = sunPos.altitude;
    const azimuth = sunPos.azimuth;

    const distance = 1_000_000;
    const x = distance * Math.cos(altitude) * Math.sin(azimuth);
    const y = distance * Math.cos(altitude) * Math.cos(azimuth);
    const z = distance * Math.sin(altitude);

    if (!viewer.scene.light) {
      viewer.scene.light = new DirectionalLight({
        direction: new Cartesian3(x, y, z),
        color: Color.WHITE
      });
    } else {
      (viewer.scene.light as DirectionalLight).direction = new Cartesian3(x, y, z);
    }

    viewer.clock.currentTime = JulianDate.fromDate(current);
  }, [hour, date, geoLocation]);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      {sunTimes && geoLocation && (
        <div className="p-6 absolute top-0 left-0 right-0 bg-neutral-lightest shadow-md rounded-b-xl z-50 flex flex-col gap-4 items-center">
          <div className="flex gap-4 items-center w-full">
            <DatePicker value={date} onChange={setDate} />
            <FiSunrise className="text-primary" />
            <Range
              min={sunriseHour}
              max={sunsetHour}
              value={hour}
              onChange={(value) => setHour(value)}
            />
            <FiSunset className="text-primary" />
            <span className="w-12 text-center py-2 rounded-xl bg-primary/20">{hour}h</span>
          </div>
        </div>
      )}
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default CesiumMap;
