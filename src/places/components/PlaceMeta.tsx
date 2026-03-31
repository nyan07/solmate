import { StarIcon, MapPinIcon, WalletIcon } from "@heroicons/react/24/solid";
import { Dot } from "../../components/Dot";
import { calculateDistance } from "../../utils/calculateDistance";
import type { LatLng } from "../../types/LatLng";
import type { PriceLevel } from "../types/Place";

const PRICE_LEVEL_LABEL: Record<PriceLevel, string> = {
    PRICE_LEVEL_FREE: "Free",
    PRICE_LEVEL_INEXPENSIVE: "$",
    PRICE_LEVEL_MODERATE: "$$",
    PRICE_LEVEL_EXPENSIVE: "$$$",
    PRICE_LEVEL_VERY_EXPENSIVE: "$$$$",
};

type Props = {
    geolocation?: LatLng | null;
    location: LatLng;
    rating?: number;
    priceLevel?: PriceLevel;
};

export const PlaceMeta = ({ geolocation, location, rating, priceLevel }: Props) => {
    const items = [
        geolocation && (
            <span key="distance" className="flex gap-1 items-center">
                <MapPinIcon className="w-4 h-4 text-accent" />
                {calculateDistance(geolocation, location)}
            </span>
        ),
        rating && (
            <span key="rating" className="flex gap-1 items-center">
                <StarIcon className="w-4 h-4 text-amber-300" />
                {rating}
            </span>
        ),
        priceLevel && (
            <span key="price" className="flex gap-1 items-center">
                <WalletIcon className="w-4 h-4 text-amber-900" />
                {PRICE_LEVEL_LABEL[priceLevel]}
            </span>
        ),
    ].filter(Boolean);

    if (!items.length) return null;

    return (
        <div className="flex items-center align-middle text-neutral-dark/50 font-normal text-sm border-y border-primary-100 py-2">
            {items.map((item, i) => (
                <span key={i} className="flex items-center">
                    {i > 0 && <Dot />}
                    {item}
                </span>
            ))}
        </div>
    );
};
