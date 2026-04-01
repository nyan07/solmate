import { PlaceItem } from "@/features/places/components/PlaceItem";
import SwipeUp from "@/components/SwipeUp";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useNearbyPlaces } from "@/features/explorer/hooks/useNearbyPlaces";
import { calculateDistance } from "@/utils/geo/calculateDistance";
import { useMapState, useLayout, useListUI } from "./MapContext";
import { DEFAULT_CAMERA_DISTANCE } from "@/features/explorer/constants";

function PlaceListOverlay() {
    const { geolocation } = useGeolocation();
    const { center, cameraDistance } = useMapState();
    const { topBarHeight } = useLayout();
    const { listOpen, setListOpen, listScrollTop, setListScrollTop } = useListUI();
    const { data: places } = useNearbyPlaces(center, {
        enabled: !!cameraDistance && cameraDistance <= DEFAULT_CAMERA_DISTANCE + 10,
    });

    return (
        <SwipeUp
            topOffset={topBarHeight}
            open={listOpen || undefined}
            initialScrollTop={listScrollTop}
            onOpenChange={setListOpen}
            onScroll={(e) => setListScrollTop(e.currentTarget.scrollTop)}
        >
            <ul className="w-full gap-2 flex flex-col py-2">
                {places &&
                    places.map((place) => (
                        <li key={`place-${place.id}`}>
                            <PlaceItem
                                place={place}
                                distance={
                                    geolocation
                                        ? calculateDistance(geolocation, place.location)
                                        : ""
                                }
                            />
                        </li>
                    ))}
            </ul>
        </SwipeUp>
    );
}
export default PlaceListOverlay;
