import { PlaceItem } from "@/features/places/components/PlaceItem";
import SwipeUp from "@/components/SwipeUp";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useFilteredPlaces } from "@/features/explorer/hooks/useFilteredPlaces";
import { calculateDistance } from "@/utils/geo/calculateDistance";
import { useMapState, useLayout, useListUI, useFilters } from "@/features/explorer/state/mapStore";
import { MAX_CAMERA_DISTANCE } from "@/features/explorer/constants";
import { useTranslation } from "react-i18next";
import { Loader } from "@/components/Loader";

function PlaceListOverlay() {
    const { geolocation } = useGeolocation();
    const { bounds, cameraDistance } = useMapState();
    const { topBarHeight } = useLayout();
    const { listOpen, setListOpen, listScrollTop, setListScrollTop } = useListUI();
    const { i18n } = useTranslation();
    const { data: places, isPending } = useFilteredPlaces(bounds, {
        enabled: !!cameraDistance && cameraDistance <= MAX_CAMERA_DISTANCE,
        lang: i18n.language,
    });
    const { filters } = useFilters();
    const hasActiveFilters = filters.openOnly || filters.outdoorSeatingOnly;
    const { t } = useTranslation();

    return (
        <SwipeUp
            topOffset={topBarHeight}
            open={listOpen || undefined}
            initialScrollTop={listScrollTop}
            onOpenChange={setListOpen}
            onScroll={(e) => setListScrollTop(e.currentTarget.scrollTop)}
        >
            {isPending ? (
                <Loader inline />
            ) : !places?.length ? (
                <div className="flex flex-col items-center justify-center gap-1 py-10 px-6 text-center">
                    <span className="text-primary-800 font-medium">
                        {t("placeList.empty.title")}
                    </span>
                    <span className="text-xs text-primary-400">
                        {hasActiveFilters
                            ? t("placeList.empty.withFilters")
                            : t("placeList.empty.noFilters")}
                    </span>
                </div>
            ) : (
                <ul className="w-full gap-2 flex flex-col py-2">
                    {places?.map((place) => (
                        <li key={`place-${place.id}`}>
                            <PlaceItem
                                place={place}
                                distance={
                                    geolocation
                                        ? calculateDistance(geolocation, place.location)
                                        : ""
                                }
                            />
                        </li>
                    ))}
                </ul>
            )}
        </SwipeUp>
    );
}
export default PlaceListOverlay;
