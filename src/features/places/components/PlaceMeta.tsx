import React from "react";
import { BsStar, BsGeoAlt, BsCreditCard } from "react-icons/bs";
import { Dot } from "@/components/Dot";
import { calculateDistance } from "@/utils/geo/calculateDistance";
import type { LatLng } from "@/types/LatLng";
import type { PriceLevel } from "@/features/places/types";

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
    const items: { key: string; content: React.ReactNode }[] = [];

    if (geolocation)
        items.push({
            key: "distance",
            content: (
                <>
                    <BsGeoAlt className="w-4 h-4 text-accent-500" />
                    {calculateDistance(geolocation, location)}
                </>
            ),
        });
    if (rating)
        items.push({
            key: "rating",
            content: (
                <>
                    <BsStar className="w-4 h-4 text-warning-400" />
                    {rating}
                </>
            ),
        });
    if (priceLevel)
        items.push({
            key: "price",
            content: (
                <>
                    <BsCreditCard className="w-4 h-4 text-warning-900" />
                    {PRICE_LEVEL_LABEL[priceLevel]}
                </>
            ),
        });

    if (!items.length) return null;

    return (
        <div className="flex items-center align-middle text-neutral-500 font-normal text-sm border-y border-primary-200 py-2">
            {items.map(({ key, content }, i) => (
                <span key={key} className="flex items-center gap-1">
                    {i > 0 && <Dot />}
                    {content}
                </span>
            ))}
        </div>
    );
};
