import { PlaceName } from "@/features/places/components/PlaceName";
import { XMarkIcon } from "@heroicons/react/24/solid";
import SwipeUp from "@/components/SwipeUp";
import StickyHeader from "@/components/StickyHeader";
import Button from "@/components/Button";
import { Tag } from "@/components/Tag";
import { PlaceMeta } from "@/features/places/components/PlaceMeta";
import { DaylightBar } from "@/features/places/components/DaylightBar";
import { getText } from "@/utils/getText";
import { getPlaceStatusDetail } from "@/utils/openingHours";
import type { PlaceStatusDetail } from "@/utils/openingHours";
import { PlaceOpeningHours } from "@/features/places/components/PlaceOpeningHours";
import { PlaceAccessibility } from "@/features/places/components/PlaceAccessibility";
import { useGeolocation } from "@/hooks/useGeolocation";
import { usePlace } from "@/features/places/hooks/usePlace";
import { useParams, useNavigate } from "react-router-dom";
import { useLayout } from "./MapContext";
import { useState } from "react";
import { PlaceStatusBadge } from "@/features/places/components/PlaceStatusBadge";
import { useSunnyHours } from "@/features/places/hooks/useSunnyHours";

function PlaceDetailOverlay() {
    const { geolocation } = useGeolocation();
    const { placeId } = useParams();
    const navigate = useNavigate();
    const { data: place } = usePlace(placeId, { enabled: !!placeId });

    const { topBarHeight } = useLayout();
    const [scrolled, setScrolled] = useState(false);
    const sunnyHours = useSunnyHours(new Date(), place?.location ?? null);

    if (!place) return null;

    const tags: string[] = [
        place.hasOutdoorSeating && "Outdoor seating",
        place.goodForGroups && "Good for groups",
        place.goodForChildren && "Good for children",
        place.allowsDogs && "Dogs allowed",
    ].filter((t): t is string => !!t);

    const statusDetail: PlaceStatusDetail | null =
        place.businessStatus === "CLOSED_TEMPORARILY"
            ? { status: "temporarily closed" }
            : place.businessStatus === "CLOSED_PERMANENTLY"
              ? { status: "permanently closed" }
              : getPlaceStatusDetail(place.openingHours);

    return (
        <SwipeUp
            defaultOpen={true}
            topOffset={topBarHeight}
            onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 0)}
        >
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
                        className="text-neutral-dark/40 hover:text-neutral-dark mt-1.5 bg-primary-100 rounded-full p-1"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                }
            />
            <div className="flex flex-col rounded-b-lg p-4 pt-0 gap-6 bg-primary-50">
                {statusDetail && <PlaceStatusBadge statusDetail={statusDetail} />}

                <PlaceMeta
                    geolocation={geolocation}
                    location={place.location}
                    rating={place.rating}
                    priceLevel={place.priceLevel}
                />

                {place.photoUrl && (
                    <div className="w-full h-48 rounded-xl overflow-hidden bg-primary-100">
                        <img
                            src={place.photoUrl}
                            alt={getText(place.displayName) ?? ""}
                            className="object-cover w-full h-full"
                        />
                    </div>
                )}

                {sunnyHours && (
                    <div className="flex flex-col gap-2">
                        <p>Best time to catch the sun here today:</p>
                        <DaylightBar startTime={sunnyHours.start} endTime={sunnyHours.end} />
                    </div>
                )}

                {place.editorialSummary && (
                    <p className="text-neutral-dark/80">{getText(place.editorialSummary)}</p>
                )}

                <div className="flex flex-col gap-0.5">
                    <PlaceOpeningHours
                        statusDetail={statusDetail}
                        weekdayDescriptions={place.regularOpeningHours?.weekdayDescriptions}
                        position={place.accessibilityOptions && "first"}
                    />

                    <PlaceAccessibility options={place.accessibilityOptions} position="last" />
                </div>

                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <Tag key={tag} name={tag} />
                        ))}
                    </div>
                )}

                <div className="flex w-full gap-2">
                    <Button
                        variant="outline"
                        href={`https://www.google.com/maps/dir/?api=1&destination=${place.location.latitude},${place.location.longitude}&destination_place_id=${place.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="grow"
                    >
                        Navigate
                    </Button>
                    <Button
                        variant="outline"
                        href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${place.location.latitude},${place.location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="grow"
                    >
                        Streetview
                    </Button>
                    {place.reservable && (
                        <Button href={place.websiteUri} className="grow">
                            Book a table
                        </Button>
                    )}
                </div>
            </div>
        </SwipeUp>
    );
}

export default PlaceDetailOverlay;
