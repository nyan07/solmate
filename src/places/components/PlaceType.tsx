import { PlaceTypeIcon } from "./PlaceTypeIcon";

type Props = {
    type: string;
    label?: string;
};

export const PlaceType = ({ type, label }: Props) => (
    <span title={label ?? type} className="inline-flex items-center">
        <PlaceTypeIcon type={type} className="w-[1em] h-[1em]" />
    </span>
);
