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
  VerticalOrigin,
} from "cesium";
import { useNearbyPlaces } from "../../places/hooks/useNearbyPlaces";
import { useMapContext } from "../MapContext";

const DEFAULT_CAMERA_DISTANCE = 700;

export const usePins = (
  viewer: Viewer | null,
  visible: boolean,
  offsetHeight: number = 20
) => {
  const { center, cameraDistance } = useMapContext();
  const { data: places } = useNearbyPlaces(center, {
    enabled: !!cameraDistance && cameraDistance <= DEFAULT_CAMERA_DISTANCE + 10,
  });
  const [heights, setHeights] = useState<Record<string, number>>({});
  const pinDarkColor = Color.fromCssColorString("#8591b5");

  // Carrega altura do terreno para todos os places
  useEffect(() => {
    if (!viewer || !visible || !places?.length) return;

    const loadHeights = async () => {
      const cartographics = places.map((p) =>
        Cartographic.fromDegrees(p.location.longitude, p.location.latitude)
      );

      const samples = await sampleTerrainMostDetailed(
        viewer.terrainProvider,
        cartographics
      );

      const mapped: Record<string, number> = {};
      places.forEach((p, i) => {
        mapped[p.id] = (samples[i].height ?? 0) + offsetHeight;
      });

      setHeights(mapped);
    };

    loadHeights();
  }, [viewer, places, visible, offsetHeight]);

  useEffect(() => {
    if (!viewer || !visible || !places?.length) return;

    // cria billboards e linhas para cada place
    places.forEach((place) => {
      const terrainHeight = heights[place.id];
      if (terrainHeight == null) return;

      const { latitude, longitude } = place.location;

      // posição da imagem
      const billboardPos = new CallbackPositionProperty(
        () => Cartesian3.fromDegrees(longitude, latitude, terrainHeight),
        false,
        ReferenceFrame.FIXED
      );

      // posição da linha
      const linePos = new CallbackProperty(
        () => {
          const ground = Cartesian3.fromDegrees(
            longitude,
            latitude,
            terrainHeight - offsetHeight
          );
          const top = Cartesian3.fromDegrees(longitude, latitude, terrainHeight);
          return [ground, top];
        },
        false
      );

      // cria ou atualiza billboard
      let billboard = viewer.entities.getById(`place-billboard-${place.id}`);
      if (!billboard) {
        billboard = viewer.entities.add({
          id: `place-billboard-${place.id}`,
          position: billboardPos,
          billboard: {
            image: "pin.png", // caminho da sua imagem
            scale: 1, // ajuste fino do tamanho
            verticalOrigin: VerticalOrigin.BOTTOM, // ancora pela base
            disableDepthTestDistance: Number.POSITIVE_INFINITY, // sempre visível
          },
        });
      } else {
        billboard.position = billboardPos;
      }

      // cria ou atualiza linha
      let line = viewer.entities.getById(`place-line-${place.id}`);
      if (!line) {
        line = viewer.entities.add({
          id: `place-line-${place.id}`,
          polyline: {
            positions: linePos,
            width: 3,
            material: pinDarkColor,
          },
        });
      } else {
        line.polyline!.positions = linePos;
      }
    });

    // cleanup
    return () => {
      places.forEach((place) => {
        const billboard = viewer.entities.getById(`place-billboard-${place.id}`);
        const line = viewer.entities.getById(`place-line-${place.id}`);
        if (billboard) viewer.entities.remove(billboard);
        if (line) viewer.entities.remove(line);
      });
    };
  }, [viewer, places, heights, offsetHeight, visible]);
};
