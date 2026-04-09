import { Switch } from "@/components/Switch";
import { useFilters, type PlaceFilters } from "@/features/explorer/state/mapStore";
import { useTranslation } from "react-i18next";
import { trackEvent } from "@/utils/analytics";

type FilterRowProps = {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
};

const FilterRow = ({ label, checked, onChange }: FilterRowProps) => (
    <div className="flex items-center justify-between gap-6">
        <span className="text-sm text-primary-800">{label}</span>
        <Switch checked={checked} onChange={onChange} />
    </div>
);

export function ExplorerFilter() {
    const { filters, setFilters } = useFilters();
    const { t } = useTranslation();

    const FILTER_NAMES: Record<keyof PlaceFilters, string> = {
        openOnly: "open_only",
        outdoorSeatingOnly: "outdoor_seating",
        sunnyOnly: "sunny_places",
    };

    const update = (patch: Partial<PlaceFilters>) => {
        const [key, enabled] = Object.entries(patch)[0] as [keyof PlaceFilters, boolean];
        trackEvent("filter_toggled", { filter: FILTER_NAMES[key], enabled });
        setFilters({ ...filters, ...patch });
    };

    return (
        <div className="absolute top-full right-0 mt-5 z-50">
            {/* Panel */}
            <div className="relative bg-primary-50 rounded-lg shadow-lg p-4 flex flex-col gap-3 w-max">
                <FilterRow
                    label={t("filter.open")}
                    checked={filters.openOnly}
                    onChange={(v) => update({ openOnly: v })}
                />
                <FilterRow
                    label={t("filter.outdoorSeating")}
                    checked={filters.outdoorSeatingOnly}
                    onChange={(v) => update({ outdoorSeatingOnly: v })}
                />
                <FilterRow
                    label={t("filter.sunnyPlaces")}
                    checked={filters.sunnyOnly}
                    onChange={(v) => update({ sunnyOnly: v })}
                />
            </div>
        </div>
    );
}
