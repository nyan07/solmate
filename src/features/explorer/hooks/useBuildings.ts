import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { LatLng } from "../../../types/LatLng";
import { getBoundingBox } from "../../../utils/geo/getBoundingBox";
import type { Building } from "../types";

const fetchBuildings = async (location: LatLng): Promise<Building[]> => {
    const bbox = getBoundingBox(location, 500);
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];way["building"](${bbox});out body;>;out skel qt;`;

    const response = await fetch(overpassUrl);
    if (!response.ok) {
        throw new Error(`Error fetching buildings: ${response.statusText}`);
    }

    const data = await response.json();

    type OverpassElement = {
        type: string;
        id: number;
        lat: number;
        lon: number;
        nodes: number[];
        tags?: Record<string, string>;
    };

    const nodesMap: Record<number, [number, number]> = {};
    data.elements.forEach((el: OverpassElement) => {
        if (el.type === "node") {
            nodesMap[el.id] = [el.lat, el.lon];
        }
    });

    // Filter ways with building tags
    const ways = data.elements.filter(
        (el: OverpassElement) => el.type === "way" && el.tags?.building
    );

    const parsedBuildings: Building[] = ways.map((way: OverpassElement) => {
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
        queryFn: () => (location ? fetchBuildings(location) : Promise.resolve([])),
        enabled: !!location,
    });
};
