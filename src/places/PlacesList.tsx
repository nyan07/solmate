import { PlaceItem } from "./components/PlaceItem";
import SwipeUp from "../components/SwipeUp";
import { useGeolocation } from "../hooks/useGeolocation";
import { useNearbyPlaces } from "./hooks/useNearbyPlaces";
import { calculateDistance } from "../utils/calculateDistance";
import { useMapState, useLayout, useListUI } from "../map/MapContext";
import { DEFAULT_CAMERA_DISTANCE } from "../map/constants";

function PlacesList() {
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
            <ul className="w-full gap-2 flex flex-col px-2 py-2">
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
export default PlacesList;
