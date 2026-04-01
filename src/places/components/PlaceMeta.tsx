import React from "react";
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
    const items: { key: string; content: React.ReactNode }[] = [];

    if (geolocation)
        items.push({
            key: "distance",
            content: (
                <>
                    <MapPinIcon className="w-4 h-4 text-accent" />
                    {calculateDistance(geolocation, location)}
                </>
            ),
        });
    if (rating)
        items.push({
            key: "rating",
            content: (
                <>
                    <StarIcon className="w-4 h-4 text-amber-300" />
                    {rating}
                </>
            ),
        });
    if (priceLevel)
        items.push({
            key: "price",
            content: (
                <>
                    <WalletIcon className="w-4 h-4 text-amber-900" />
                    {PRICE_LEVEL_LABEL[priceLevel]}
                </>
            ),
        });

    if (!items.length) return null;

    return (
        <div className="flex items-center align-middle text-neutral-dark/50 font-normal text-sm border-y border-primary-100 py-2">
            {items.map(({ key, content }, i) => (
                <span key={key} className="flex items-center gap-1">
                    {i > 0 && <Dot />}
                    {content}
                </span>
            ))}
        </div>
    );
};
