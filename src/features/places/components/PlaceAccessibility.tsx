import { UserCircleIcon } from "@heroicons/react/24/outline";
import { Expandable } from "@/components/Expandable";
import type { ExpandablePosition } from "@/components/Expandable";
import type { AccessibilityOptions } from "@/features/places/types";

const ACCESSIBILITY_LABELS: { key: keyof AccessibilityOptions; label: string }[] = [
    { key: "wheelchairAccessibleEntrance", label: "Wheelchair accessible entrance" },
    { key: "wheelchairAccessibleParking", label: "Wheelchair accessible parking" },
    { key: "wheelchairAccessibleRestroom", label: "Wheelchair accessible restroom" },
    { key: "wheelchairAccessibleSeating", label: "Wheelchair accessible seating" },
];

type Props = {
    options?: AccessibilityOptions;
    position?: ExpandablePosition;
};

export const PlaceAccessibility = ({ options, position }: Props) => {
    if (!options) return null;

    const available = ACCESSIBILITY_LABELS.filter(({ key }) => options[key]);
    if (!available.length) return null;

    return (
        <Expandable
            icon={<UserCircleIcon className="w-4 h-4 text-neutral-dark/50 shrink-0" />}
            title={<span className="font-medium text-neutral-dark/70">Accessibility options</span>}
            position={position}
        >
            <div className="text-sm text-neutral-dark/70 w-full ml-6">
                <ul className="text-sm text-neutral-dark/70 flex flex-col gap-1 list-disc">
                    {available.map(({ label }) => (
                        <li key={label}>{label}</li>
                    ))}
                </ul>
            </div>
        </Expandable>
    );
};
