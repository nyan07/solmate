import { Tag } from "@/components/Tag";
import type { TagTone } from "@/components/Tag/types";
import type { PlaceStatusDetail } from "@/utils/openingHours";

const TONE: Record<string, TagTone> = {
    open: "success",
    "opening soon": "warning",
    "closing soon": "warning",
    closed: "neutral",
    "temporarily closed": "neutral",
    "permanently closed": "neutral",
};

type Props = {
    statusDetail: PlaceStatusDetail;
    showDetail?: boolean;
    className?: string;
};

export const PlaceStatusBadge = ({ statusDetail, showDetail = true, className }: Props) => (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
        <Tag name={statusDetail.status} tone={TONE[statusDetail.status]} variant="outline" />
        {showDetail && statusDetail.detail && (
            <span className="text-sm text-neutral-500">{statusDetail.detail}</span>
        )}
    </span>
);
