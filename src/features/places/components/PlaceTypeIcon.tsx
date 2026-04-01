import BarIcon from "../../../assets/bar.svg?react";
import CafeIcon from "../../../assets/cafe.svg?react";
import RestaurantIcon from "../../../assets/restaurant.svg?react";
import type { PlaceTypes } from "../types";

const PLACE_ICONS: { [key in PlaceTypes]: React.FC<React.SVGProps<SVGSVGElement>> } = {
    bar: BarIcon,
    cafe: CafeIcon,
    restaurant: RestaurantIcon,
};

function resolveIcon(type: string) {
    if (PLACE_ICONS[type as PlaceTypes]) return PLACE_ICONS[type as PlaceTypes];
    if (type.includes("restaurant")) return PLACE_ICONS.restaurant;
    if (type.includes("bar") || type.includes("pub")) return PLACE_ICONS.bar;
    if (type.includes("cafe") || type.includes("coffee")) return PLACE_ICONS.cafe;
    return null;
}

export const PlaceTypeIcon = ({ type, className }: { type: string; className?: string }) => {
    const Icon = resolveIcon(type);
    return <span className={`w-4 h-4 ${className}`}>{Icon && <Icon className={className} />}</span>;
};
