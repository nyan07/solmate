import { PlaceTypeIcon } from "./PlaceTypeIcon"
import { Tag } from "../../components/Tag"
import { PlaceStatus } from "./PlaceStatus"
import { Link } from "react-router-dom"
import type { PlaceSummary } from "../types/PlaceSummary"
import { getOpeningHoursStatus } from "../../utils/openingHours"
import { getText } from "../../utils/getText"

type PlaceItemProps = {
    place: PlaceSummary;
    distance: string;
}

export const PlaceItem = ({ place, distance }: PlaceItemProps) => {
    const openingHoursStatus = getOpeningHoursStatus(place.openingHours);

    return (
        <Link to={`/places/${place.id}`}>
            <div className='rounded-lg p-4 flex flex-col gap-2 bg-primary/20'>
                <div className='flex gap-2 relative items-center -mt-1'>
                    <span className='absolute -top-2 right-0'>{distance}</span>
                    <h4 className='text-neutral-dark grow-1 text-lg inline'>
                        <span className="pt-1">{getText(place.displayName)}</span>
                        <span className="pl-2"><PlaceTypeIcon type={place.primaryType} className="w-4 h-4 inline" /></span>
                    </h4>
                </div>
                <div className='flex gap-2'>
                    {openingHoursStatus && <PlaceStatus status={openingHoursStatus} />}
                    {place.hasOutdoorSeating && <Tag name="Outdoor Seating" />}
                </div>
                <p className="text-neutral-dark/70">{getText(place.editorialSummary)}</p>
            </div>
        </Link>
    )
}
