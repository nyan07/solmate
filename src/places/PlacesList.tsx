import { PlaceItem } from "./components/PlaceItem";
import SwipeUp from "../components/SwipeUp";
import { useGeolocation } from "../hooks/useGeolocation";
import { useNearbyPlaces } from "./hooks/useNearbyPlaces";
import { calculateDistance } from "../utils/calculateDistance";

function PlacesList() {
    const { geoLocation } = useGeolocation();
    const { data: places } = useNearbyPlaces(geoLocation);

    return (
        <SwipeUp>
            <ul className='w-full gap-2 flex flex-col px-2 py-2'>
                {places && location && places.map((place) => (
                    <li key={`place-${place.id}`}>
                        <PlaceItem place={place} distance={geoLocation ? calculateDistance(geoLocation, place.location) : ""} />
                    </li>
                ))}
            </ul>
        </SwipeUp>
    )
}
export default PlacesList;