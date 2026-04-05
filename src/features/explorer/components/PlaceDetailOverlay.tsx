import { PlaceName } from "@/features/places/components/PlaceName";
import { Paragraph } from "@/components/Paragraph";
import { BsX } from "react-icons/bs";
import SwipeUp from "@/components/SwipeUp";
import StickyHeader from "@/components/StickyHeader";
import Button from "@/components/Button";
import { Tag } from "@/components/Tag";
import { PlaceMeta } from "@/features/places/components/PlaceMeta";
import { getText } from "@/utils/getText";
import { getPlaceStatusDetail } from "@/utils/openingHours";
import type { PlaceStatusDetail } from "@/utils/openingHours";
import { PlaceOpeningHours } from "@/features/places/components/PlaceOpeningHours";
import { PlaceAccessibility } from "@/features/places/components/PlaceAccessibility";
import { useGeolocation } from "@/hooks/useGeolocation";
import { usePlace } from "@/features/places/hooks/usePlace";
import { useParams } from "react-router-dom";
import { useLangNavigate } from "@/hooks/useLangNavigate";
import { useLayout } from "@/features/explorer/state/mapStore";
import { useState } from "react";
import { PlaceStatusBadge } from "@/features/places/components/PlaceStatusBadge";
import { useTranslation } from "react-i18next";
import { Loader } from "@/components/Loader";

function PlaceDetailOverlay() {
    const { geolocation } = useGeolocation();
    const { placeId } = useParams();
    const navigate = useLangNavigate();
    const { t, i18n } = useTranslation();
    const { data: place, isPending } = usePlace(placeId, {
        enabled: !!placeId,
        lang: i18n.language,
    });

    const { topBarHeight } = useLayout();
    const [scrolled, setScrolled] = useState(false);

    const tags = place
        ? ([
              place.hasOutdoorSeating && t("place.tags.outdoorSeating"),
              place.goodForGroups && t("place.tags.goodForGroups"),
              place.goodForChildren && t("place.tags.goodForChildren"),
              place.allowsDogs && t("place.tags.allowsDogs"),
          ].filter(Boolean) as string[])
        : [];

    const statusDetail: PlaceStatusDetail | null = place
        ? getPlaceStatusDetail(place.openingHours)
        : null;

    return (
        <SwipeUp
            key={placeId}
            defaultOpen={true}
            topOffset={topBarHeight}
            onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 0)}
        >
            <div className="rounded-lg bg-primary-100 min-h-0">
                {isPending && <Loader inline />}
                {place && (
                    <>
                        <StickyHeader
                            scrolled={scrolled}
                            title={
                                <PlaceName
                                    name={getText(place.displayName) ?? ""}
                                    type={place.primaryType}
                                    typeLabel={place.primaryTypeDisplayName}
                                    size="lg"
                                    className={scrolled ? "truncate" : undefined}
                                />
                            }
                            actions={
                                <button
                                    onClick={() => navigate("/places")}
                                    className="text-primary-500 hover:text-primary-700 mt-1.5 bg-primary-200 rounded-full p-1"
                                >
                                    <BsX className="w-5 h-5" />
                                </button>
                            }
                        />
                        <div className="flex flex-col p-4 pt-0 gap-6">
                            {statusDetail && <PlaceStatusBadge statusDetail={statusDetail} />}

                            <PlaceMeta
                                geolocation={geolocation}
                                location={place.location}
                                rating={place.rating}
                                priceLevel={place.priceLevel}
                            />

                            {place.photoUrl && (
                                <div className="w-full h-48 rounded-xl overflow-hidden bg-primary-200">
                                    <img
                                        src={place.photoUrl}
                                        alt={getText(place.displayName) ?? ""}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            )}

                            {place.editorialSummary && (
                                <Paragraph>{getText(place.editorialSummary)}</Paragraph>
                            )}

                            {tags.length > 0 && (
                                <ul className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <li key={tag}>
                                            <Tag name={tag} />
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div className="flex flex-col">
                                <PlaceOpeningHours
                                    statusDetail={statusDetail}
                                    weekdayDescriptions={
                                        place.regularOpeningHours?.weekdayDescriptions
                                    }
                                    position={place.accessibilityOptions && "first"}
                                />
                                <PlaceAccessibility
                                    options={place.accessibilityOptions}
                                    position="last"
                                />
                            </div>

                            <div className="flex w-full gap-2">
                                <Button
                                    variant="outline"
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${place.location.latitude},${place.location.longitude}&destination_place_id=${place.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="grow"
                                >
                                    {t("place.actions.navigate")}
                                </Button>
                                <Button
                                    variant="outline"
                                    href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${place.location.latitude},${place.location.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="grow"
                                >
                                    {t("place.actions.streetview")}
                                </Button>
                                {place.reservable && (
                                    <Button href={place.websiteUri} className="grow">
                                        {t("place.actions.bookTable")}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </SwipeUp>
    );
}

export default PlaceDetailOverlay;
