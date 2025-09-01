import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { LatLng } from "../../types/LatLng";
import type { PlaceSummary } from "../types/PlaceSummary";


const parsePlaceSummary = ({ location: { lat, lng }, displayName, primaryType, editorialSummary, id }: any): PlaceSummary => {
    return {
        id,
        displayName,
        primaryType,
        editorialSummary,
        location: { lat: lat(), lng: lng() }
    }
}

const fetchNearbyPlaces = async (location: LatLng): Promise<PlaceSummary[]> => {
    const placesLib = await google.maps.importLibrary("places") as any;
    const { Place, SearchNearbyRankPreference } = placesLib;

    const request: google.maps.places.SearchNearbyRequest = {
        fields: ["id", "displayName", "primaryType", "editorialSummary", "location"], //"regularOpeningHours",
        locationRestriction: {
            center: location,
            radius: 500,
        },
        includedPrimaryTypes: ["restaurant", "cafe", "bar"],
        maxResultCount: 20,
        language: 'en-US',
        rankPreference: SearchNearbyRankPreference.DISTANCE,
    };

    const { places } = await Place.searchNearby(request);
    return places.map(parsePlaceSummary) ?? [];
};

export const useNearbyPlaces = (location: LatLng | null): UseQueryResult<PlaceSummary[]> => {
    return useQuery({
        queryKey: ["nearbyPlaces", location],
        queryFn: () =>
            location
                ? fetchNearbyPlaces(location)
                : Promise.resolve([]),
        enabled: !!location,
    });
};
