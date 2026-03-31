import { PlaceName } from "./PlaceName";
import { Tag } from "../../components/Tag";
import { PlaceStatusBadge } from "./PlaceStatusBadge";
import { Link } from "react-router-dom";
import type { PlaceSummary } from "../types/PlaceSummary";
import { getPlaceStatusDetail } from "../../utils/openingHours";
import type { PlaceStatusDetail } from "../../utils/openingHours";
import { getText } from "../../utils/getText";

const truncate = (text: string | undefined, maxWords: number) => {
    if (!text) return text;
    const words = text.split(" ");
    return words.length <= maxWords ? text : words.slice(0, maxWords).join(" ") + "…";
};

type PlaceItemProps = {
    place: PlaceSummary;
    distance: string;
};

export const PlaceItem = ({ place, distance }: PlaceItemProps) => {
    const statusDetail: PlaceStatusDetail | null =
        place.businessStatus === "CLOSED_TEMPORARILY"
            ? { status: "temporarily closed" }
            : place.businessStatus === "CLOSED_PERMANENTLY"
              ? { status: "permanently closed" }
              : getPlaceStatusDetail(place.openingHours);

    return (
        <Link to={`/places/${place.id}`}>
            <div className="rounded-lg p-4 flex flex-col gap-2 bg-primary-50">
                <div className="flex gap-3 items-start">
                    <PlaceName
                        name={getText(place.displayName) ?? ""}
                        type={place.primaryType}
                        typeLabel={place.primaryTypeDisplayName}
                        size="md"
                        className="flex-1"
                    />
                    <span className="text-sm text-neutral-dark/50 shrink-0 pt-1">{distance}</span>
                </div>
                <div className="flex gap-2">
                    {statusDetail && (
                        <PlaceStatusBadge statusDetail={statusDetail} showDetail={false} />
                    )}
                    {place.hasOutdoorSeating && <Tag name="Outdoor Seating" />}
                </div>
                <p className="text-neutral-dark/70">
                    {truncate(getText(place.editorialSummary), 12)}
                </p>
            </div>
        </Link>
    );
};
