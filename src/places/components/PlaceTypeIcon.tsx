import BarIcon from '../../assets/bar.svg?react';
import CafeIcon from '../../assets/cafe.svg?react';
import RestaurantIcon from '../../assets/restaurant.svg?react';
import type { PlaceTypes } from '../types/PlaceTypes';

const PLACE_ICONS: { [key in PlaceTypes]: React.FC<React.SVGProps<SVGSVGElement>> } = {
    bar: BarIcon,
    cafe: CafeIcon,
    restaurant: RestaurantIcon,
};

export const PlaceTypeIcon = ({ type, className }: { type: PlaceTypes, className?: string }) => {
    const Icon = PLACE_ICONS[type];
    return (
        <span className={`w-4 h-4 ${className}`}>
            {Icon && <Icon className={className} />}
        </span>
    )
}