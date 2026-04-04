import { Switch } from "@/components/Switch";
import { useFilters, type PlaceFilters } from "./MapContext";
import { useTranslation } from "react-i18next";

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

    const update = (patch: Partial<PlaceFilters>) => setFilters({ ...filters, ...patch });

    return (
        <div className="absolute top-full right-0 mt-5 z-50">
            {/* Panel */}
            <div className="relative bg-primary-50 rounded-lg shadow-lg p-4 flex flex-col gap-3 w-max">
                <FilterRow
                    label={t("filter.openNow")}
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
