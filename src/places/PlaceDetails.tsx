import { PlaceStatus } from "./components/PlaceStatus";
import { PlaceTypeIcon } from "./components/PlaceTypeIcon";
import SwipeUp from "../components/SwipeUp";
import { Tag } from "../components/Tag";
import type { Place } from "./types/Place";
import Button from "../components/Button";
import { StarIcon } from '@heroicons/react/24/solid'
import { DaylightBar } from "./components/DaylightBar";

const place: Place =
{
    id: 1,
    name: "Brew & Bloom",
    type: "cafe",
    tags: ["Terrace", "Allow Dogs"],
    distance: "300m",
    status: 'open now',
    description: "Casual café serving freshly brewed coffee, light breakfast options, and a selection of vegan pastries and sandwiches.",
    imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300&auto=format&fit=crop",
}

function PlaceDetails() {
    return (
        <SwipeUp>
            <div className='p-4 flex flex-col gap-2'>
                <div className='flex gap-2 relative items-center -mt-1'>
                    <span className='absolute -top-2 right-0'>{place.distance}</span>
                    <img src={place.imageUrl} className='w-12 h-12 rounded-full' />
                    <h2 className='text-neutral-dark grow-1 text-2xl flex'>
                        <span className="pt-1 mr-1">{place.name}</span>
                        <PlaceTypeIcon type={place.type} className="inline" />
                    </h2>

                </div>
                <div className='flex gap-2'>
                    <PlaceStatus status={place.status} />
                    {place.tags.map((tag: string) => (<Tag key={`tag-${tag}`} name={tag} />))}
                </div>
                <p>{place.description}</p>

                <span className="flex gap-2 my-4"><StarIcon className="w-6 h-6 text-amber-300"/> 4,5</span>

                <p>Best time to catch up the sun here today:</p>
                <DaylightBar startTime="10:45" endTime="16:15" />

                <div className="flex w-full gap-2 mt-8 ">
                    <Button className="grow">Navigate</Button>
                    <Button className="grow">Streetview</Button>
                    <Button className="grow">Book a table</Button>

                </div>
            </div>
        </SwipeUp>
    )
}
export default PlaceDetails;