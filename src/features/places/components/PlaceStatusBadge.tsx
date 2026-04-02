import { Tag } from "@/components/Tag";
import type { TagTone } from "@/components/Tag/types";
import type { PlaceStatusDetail } from "@/utils/openingHours";
import { useTranslation } from "react-i18next";

const TONE: Record<string, TagTone> = {
    open: "success",
    "opening soon": "warning",
    "closing soon": "warning",
    closed: "neutral",
    "temporarily closed": "neutral",
    "permanently closed": "neutral",
};

const STATUS_KEY = {
    open: "status.open",
    "opening soon": "status.openingSoon",
    "closing soon": "status.closingSoon",
    closed: "status.closed",
    "temporarily closed": "status.temporarilyClosed",
    "permanently closed": "status.permanentlyClosed",
} as const;

type Props = {
    statusDetail: PlaceStatusDetail;
    showDetail?: boolean;
    className?: string;
};

export const PlaceStatusBadge = ({ statusDetail, showDetail = true, className }: Props) => {
    const { t } = useTranslation();
    return (
        <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
            <Tag
                name={t(STATUS_KEY[statusDetail.status])}
                tone={TONE[statusDetail.status]}
                variant="outline"
            />
            {showDetail && statusDetail.detail && (
                <span className="text-sm text-neutral-500">{statusDetail.detail}</span>
            )}
        </span>
    );
};
