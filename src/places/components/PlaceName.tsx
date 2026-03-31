import { PlaceType } from "./PlaceType";

type Size = "sm" | "md" | "lg";

const SIZE_CLASS: Record<Size, string> = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
};

type Props = {
    name: string;
    type: string;
    typeLabel?: string;
    size?: Size;
    className?: string;
};

export const PlaceName = ({ name, type, typeLabel, size = "md", className = "" }: Props) => {
    const isTruncated = className.includes("truncate");

    if (isTruncated) {
        return (
            <h4 className={`text-neutral-dark ${SIZE_CLASS[size]} overflow-hidden ${className}`}>
                <span className="truncate">{name}</span>
            </h4>
        );
    }

    const words = name.split(" ");
    const last = words.pop() ?? "";

    return (
        <h4 className={`text-neutral-dark ${SIZE_CLASS[size]} ${className}`}>
            {words.join(" ")}
            {words.length > 0 ? " " : ""}
            <span className="whitespace-nowrap inline-flex items-center gap-1">
                {last}
                <PlaceType type={type} label={typeLabel} />
            </span>
        </h4>
    );
};
