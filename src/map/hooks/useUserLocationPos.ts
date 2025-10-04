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
import type { LatLng } from "../../types/LatLng";

export const useUserLocationPos = (
  viewer: Viewer | null,
  geolocation: LatLng | null,
  visible: boolean,
  offsetHeight: number = 20
) => {
  const [terrainHeight, setTerrainHeight] = useState<number | null>(null);

  // Carrega altura do terreno
  useEffect(() => {
    if (!viewer || !geolocation || !visible) return;

    const loadHeight = async () => {
      const cartographic = Cartographic.fromDegrees(geolocation.longitude, geolocation.latitude);
      const [terrainSample] = await sampleTerrainMostDetailed(viewer.terrainProvider, [cartographic]);
      setTerrainHeight((terrainSample.height ?? 0) + offsetHeight);
    };

    loadHeight();
  }, [viewer, geolocation, visible, offsetHeight]);

  useEffect(() => {
    if (!viewer || !geolocation || terrainHeight === null) return;

    // Cria posição da esfera
    const spherePos = new CallbackPositionProperty(
      () => Cartesian3.fromDegrees(geolocation.longitude, geolocation.latitude, terrainHeight),
      false,
      ReferenceFrame.FIXED
    );

    // Cria posição da linha (do chão até a esfera)
    const linePos = new CallbackProperty(
      () => {
        const ground = Cartesian3.fromDegrees(geolocation.longitude, geolocation.latitude, terrainHeight - offsetHeight);
        const top = Cartesian3.fromDegrees(geolocation.longitude, geolocation.latitude, terrainHeight);
        return [ground, top];
      },
      false
    );

    // Cria ou atualiza a esfera
    let sphere = viewer.entities.getById("location-sphere");
    if (!sphere) {
      sphere = viewer.entities.add({
        id: "location-sphere",
        position: spherePos,
        point: {
          pixelSize: 14,
          color: Color.BLUE,
          outlineColor: Color.WHITE,
          outlineWidth: 2,
        },
      });
    } else {
      sphere.position = spherePos;
    }

    // Cria ou atualiza a linha
    let line = viewer.entities.getById("location-line");
    if (!line) {
      line = viewer.entities.add({
        id: "location-line",
        polyline: {
          positions: linePos,
          width: 2,
          material: Color.BLUE,
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
