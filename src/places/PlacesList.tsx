import { PlaceItem } from "./components/PlaceItem";
import SwipeUp from "../components/SwipeUp";
import { useGeolocation } from "../hooks/useGeolocation";
import { useNearbyPlaces } from "./hooks/useNearbyPlaces";
import { calculateDistance } from "../utils/calculateDistance";
import { useMapContext } from "../map/MapContext";

const DEFAULT_CAMERA_DISTANCE = 700;
function PlacesList() {
    const { geolocation } = useGeolocation();
    const { center, cameraDistance } = useMapContext();
    const { data: places } = useNearbyPlaces(center, { enabled: !!cameraDistance && cameraDistance <= DEFAULT_CAMERA_DISTANCE + 10 });

    return (
        <SwipeUp>
            <ul className='w-full gap-2 flex flex-col px-2 py-2'>
                {places && location && places.map((place) => (
                    <li key={`place-${place.id}`}>
                        <PlaceItem place={place} distance={geolocation ? calculateDistance(geolocation, place.location) : ""} />
                    </li>
                ))}
            </ul>
        </SwipeUp>
    )
}
export default PlacesList;