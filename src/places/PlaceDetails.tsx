import { PlaceTypeIcon } from "./components/PlaceTypeIcon";
import SwipeUp from "../components/SwipeUp";
import Button from "../components/Button";
import { StarIcon, MapPinIcon } from '@heroicons/react/24/solid'
import { DaylightBar } from "./components/DaylightBar";
import { calculateDistance } from "../utils/calculateDistance";
import { getText } from "../utils/getText";
import { useGeolocation } from "../hooks/useGeolocation";
import { usePlace } from "./hooks/usePlace";
import { useParams, useNavigate } from "react-router-dom";

function PlaceDetails() {
    const { geolocation } = useGeolocation();
    const { placeId } = useParams();
    const navigate = useNavigate();
    const { data: place } = usePlace(placeId, { enabled: !!placeId });

    if (!place) return null;

    return (
        <SwipeUp defaultOpen={true}>
            <div className='flex flex-col gap-4'>
                <button onClick={() => navigate('/places')} className="self-start text-primary text-sm">← Back</button>

                <h4 className='text-neutral-dark grow-1 text-2xl flex'>
                    <span className="pt-1">{getText(place.displayName)}</span>
                    <span className="pl-2"><PlaceTypeIcon type={place.primaryType} className="w-4 h-4 inline" /></span>
                </h4>

                {place.photoUrl && (
                    <div className='w-full h-48 rounded-2xl overflow-hidden'>
                        <img src={place.photoUrl} className="object-cover w-full h-full" />
                    </div>
                )}

                {place.editorialSummary && <p>{getText(place.editorialSummary)}</p>}

                <div className="flex gap-4 items-center">
                    {geolocation && (
                        <span className="flex gap-1 my-4">
                            <MapPinIcon className="w-6 h-6 text-accent" />
                            {calculateDistance(geolocation, place.location)}
                        </span>
                    )}
                    <span className="flex gap-1 my-4">
                        <StarIcon className="w-6 h-6 text-amber-300" />
                        {place.rating}
                    </span>
                </div>

                <p>Best time to catch the sun here today:</p>
                <DaylightBar startTime="10:45" endTime="16:15" />

                <div className="flex w-full gap-2 mt-8">
                    <a href={`https://www.google.com/maps/dir/@?api=1&query=${getText(place.displayName)}`} className="grow">Navigate</a>
                    <a href={`https://www.google.com/maps/@?api=1&map_action=pano&query=${getText(place.displayName)}`} className="grow">Streetview</a>
                    <Button className="grow">Book a table</Button>
                </div>
            </div>
        </SwipeUp>
    );
}

export default PlaceDetails;
