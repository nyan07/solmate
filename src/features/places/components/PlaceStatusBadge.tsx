import type { PlaceStatusDetail } from "@/utils/openingHours";

const STATUS_STYLE: Record<string, string> = {
    open: "text-green-600 border-green-600",
    "closing soon": "text-amber-500 border-amber-500",
    "opening soon": "text-amber-500 border-amber-500",
    closed: "text-red-500 border-red-500",
    "temporarily closed": "text-red-500 border-red-500",
    "permanently closed": "text-red-500 border-red-500",
};

type Props = {
    statusDetail: PlaceStatusDetail;
    showDetail?: boolean;
    className?: string;
};

export const PlaceStatusBadge = ({ statusDetail, showDetail = true, className }: Props) => (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
        <span
            className={`rounded-full px-4 py-1 border text-sm font-medium ${STATUS_STYLE[statusDetail.status]}`}
        >
            {statusDetail.status}
        </span>
        {showDetail && statusDetail.detail && (
            <span className="text-xs text-neutral-dark/50">{statusDetail.detail}</span>
        )}
    </span>
);
