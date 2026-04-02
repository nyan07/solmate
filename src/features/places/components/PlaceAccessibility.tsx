import { BsPerson } from "react-icons/bs";
import { Expandable } from "@/components/Expandable";
import type { ExpandablePosition } from "@/components/Expandable";
import type { AccessibilityOptions } from "@/features/places/types";
import { useTranslation } from "react-i18next";

const ACCESSIBILITY_KEYS = [
    {
        key: "wheelchairAccessibleEntrance" as keyof AccessibilityOptions,
        tKey: "place.accessibility.entrance" as const,
    },
    {
        key: "wheelchairAccessibleParking" as keyof AccessibilityOptions,
        tKey: "place.accessibility.parking" as const,
    },
    {
        key: "wheelchairAccessibleRestroom" as keyof AccessibilityOptions,
        tKey: "place.accessibility.restroom" as const,
    },
    {
        key: "wheelchairAccessibleSeating" as keyof AccessibilityOptions,
        tKey: "place.accessibility.seating" as const,
    },
];

type Props = {
    options?: AccessibilityOptions;
    position?: ExpandablePosition;
};

export const PlaceAccessibility = ({ options, position }: Props) => {
    const { t } = useTranslation();
    if (!options) return null;

    const available = ACCESSIBILITY_KEYS.filter(({ key }) => options[key]);
    if (!available.length) return null;

    return (
        <Expandable
            icon={<BsPerson className="w-4 h-4 text-neutral-500 shrink-0" />}
            title={
                <span className="font-medium text-neutral-500">
                    {t("place.accessibility.title")}
                </span>
            }
            position={position}
        >
            <div className="text-sm text-neutral-500 w-full ml-6">
                <ul className="text-sm text-neutral-500 flex flex-col gap-1 list-disc">
                    {available.map(({ tKey }) => (
                        <li key={tKey}>{t(tKey)}</li>
                    ))}
                </ul>
            </div>
        </Expandable>
    );
};
