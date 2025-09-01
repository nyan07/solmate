import { PlaceTypeIcon } from "./PlaceTypeIcon"
import { Tag } from "../../components/Tag"
import { PlaceStatus } from "./PlaceStatus"
import { Link } from "react-router-dom"
import type { PlaceSummary } from "../types/PlaceSummary"


type PlaceItemProps = {
    place: PlaceSummary,
    distance: string
}

export const PlaceItem = ({ place, distance }: PlaceItemProps) => {
    return (
        <Link to={`/places/${place.id}`}>
            <div className='rounded-md py-4 flex flex-col gap-2'>
                <div className='flex gap-2 relative items-center -mt-1'>
                    <span className='absolute -top-2 right-0'>{distance}</span>
                    <img src="https://www.tastingtable.com/img/gallery/the-20-best-coffee-shops-in-la-ranked/goodboybob-1685443920.webp" className='w-12 h-12 rounded-full' />
                    <h4 className='text-neutral-dark grow-1 text-2xl flex'>
                        <span className="pt-1">{place.displayName}</span>
                        <span className="pl-2"><PlaceTypeIcon type={place.primaryType} className="w-4 h-4 inline" /></span>
                    </h4>

                </div>
                <div className='flex gap-2'>
                    <PlaceStatus status="open now" />
                    <Tag name="Terrace" />
                    {/* {place.tags.map((tag: string) => (<Tag key={`place-${place.id}-tag-${tag}`} name={tag} />))} */}
                </div>
                <p>{place.editorialSummary}</p>
            </div>
        </Link>
    )
}