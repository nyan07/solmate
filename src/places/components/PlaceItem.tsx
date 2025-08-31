import { PlaceTypeIcon } from "./PlaceTypeIcon"
import type { Place } from "../types/Place"
import { Tag } from "../../components/Tag"
import { PlaceStatus } from "./PlaceStatus"
import { Link } from "react-router-dom"


type PlaceItemProps = {
    place: Place
}

export const PlaceItem = ({ place }: PlaceItemProps) => {
    return (
        <Link to={`/places/${place.id}`}>
            <div className='rounded-md py-4 flex flex-col gap-2'>
                <div className='flex gap-2 relative items-center -mt-1'>
                    <span className='absolute -top-2 right-0'>{place.distance}</span>
                    <img src={place.imageUrl} className='w-12 h-12 rounded-full' />
                    <h4 className='text-neutral-dark grow-1 text-2xl flex'>
                        <span className="pt-1">{place.name}</span>
                        <span className="pl-2"><PlaceTypeIcon type={place.type} className="w-4 h-4 inline" /></span>
                    </h4>

                </div>
                <div className='flex gap-2'>
                    <PlaceStatus status={place.status} />
                    {place.tags.map((tag: string) => (<Tag key={`place-${place.id}-tag-${tag}`} name={tag} />))}
                </div>
                <p>{place.description}</p>
            </div>
        </Link>
    )
}