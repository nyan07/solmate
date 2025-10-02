import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { LatLng } from "../../types/LatLng";
import { getBoundingBox } from "../../utils/getBoundingBox";
import type { Building } from "../types/Building";

const fetchBuildings = async (location: LatLng): Promise<Building[]> => {

  const bbox = getBoundingBox(location, 500);
  const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];way["building"](${bbox});out body;>;out skel qt;`;

  const response = await fetch(overpassUrl);
  if (!response.ok) {
    throw new Error(`Error fetching buildings: ${response.statusText}`);
  }

  const data = await response.json();

  const nodesMap: Record<number, [number, number]> = {};
  data.elements.forEach((el: any) => {
    if (el.type === 'node') {
      nodesMap[el.id] = [el.lat, el.lon];
    }
  });

  // Filter ways with building tags
  const ways = data.elements.filter(
    (el: any) => el.type === 'way' && el.tags?.building
  );

  const parsedBuildings: Building[] = ways.map((way: any) => {
    const coords: [number, number][] = way.nodes
      .map((id: number) => nodesMap[id])
      .filter(Boolean);
    const height = way.tags?.height ? parseFloat(way.tags.height) : undefined;
    return { coordinates: coords, height };
  });

  return parsedBuildings;
};

export const useBuildings = (location: LatLng | null): UseQueryResult<Building[]> => {
  return useQuery({
    queryKey: ["buildings", location],
    queryFn: () =>
      location
        ? fetchBuildings(location)
        : Promise.resolve([]),
    enabled: !!location,
  });
};

