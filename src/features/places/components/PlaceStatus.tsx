import { Tag } from "@/components/Tag";
import type { TagTone } from "@/components/Tag/types";
import type { PlaceStatuses } from "@/features/places/types";

const TONE: Record<PlaceStatuses, TagTone> = {
    open: "success",
    closed: "neutral",
};

export const PlaceStatus = ({ status }: { status: PlaceStatuses }) => (
    <Tag name={status} tone={TONE[status]} />
);
