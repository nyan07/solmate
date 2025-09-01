import { PlaceItem } from "./components/PlaceItem";
import SwipeUp from "../components/SwipeUp";
import { useGeolocation } from "../hooks/useGeolocation";
import { useNearbyPlaces } from "./hooks/useNearbyPlaces";
import { calculateDistance } from "../utils/calculateDistance";

function PlacesList() {
    const { location } = useGeolocation();
    const { data: places } = useNearbyPlaces(location);

    return (
        <SwipeUp title="Sunny places near you">
            <ul className='w-full divide-y divide-primary/50'>
                {places && location && places.map((place) => (
                    <li key={`place-${place.id}`}>
                        <PlaceItem place={place} distance={calculateDistance(location, place.location)} />
                    </li>
                ))}
            </ul>
        </SwipeUp>
    )
}
export default PlacesList;