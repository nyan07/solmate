export const config = {
    runtime: "edge",
};

const parseUrl = (url) => {
    const parts = url.pathname.split("/");

    const placeId = parts[3];

    if (placeId) {
        return { placeId };
    }
};

export async function GET(req) {
    const abortController = new AbortController();

    req.signal.addEventListener("abort", () => {
        abortController.abort();
    });

    try {
        const requestUrl = new URL(req.url, `http://${req.headers.host}`);
        const { placeId } = parseUrl(requestUrl);
        const lang = requestUrl.searchParams.get("lang") ?? "en";

        if (!placeId) {
            return error(400, "PlaceId is not defined");
        }

        const fields = [
            "id",
            "displayName",
            "primaryType",
            "primaryTypeDisplayName",
            "editorialSummary",
            "location",
            "photos",
            "currentOpeningHours",
            "formattedAddress",
            "outdoorSeating",
            "businessStatus",
            "regularOpeningHours",
            "rating",
            "accessibilityOptions",
            "goodForGroups",
            "goodForChildren",
            "priceLevel",
            "allowsDogs",
            "reservable",
            "websiteUri",
        ];

        const origin = req.headers.get("origin") || "";
        const host = req.headers.get("host") || "";

        const url = `https://places.googleapis.com/v1/places/${placeId}?languageCode=${lang}`;
        const response = await fetch(url, {
            signal: abortController.signal,
            headers: {
                "X-Goog-Api-Key": process.env.GOOGLE_PLACES_KEY,
                "X-Goog-FieldMask": fields.join(","),
                Referer: origin || `https://${host}`,
            },
        });

        if (!response.ok) {
            const body = await response.text();
            console.error("Places API error:", response.status, body);
            return error(500, `Failed to fetch: ${response.statusText}`);
        }

        const place = await response.json();
        const parsed = {
            id: place.id,
            displayName: place.displayName?.text,
            primaryType: place.primaryType,
            primaryTypeDisplayName: place.primaryTypeDisplayName?.text,
            editorialSummary: place.editorialSummary?.text,
            location: place.location,
            photoUrl: place.photos?.[0] ? `/api/${place.photos[0].name}?w=400&h=400` : undefined,
            openingHours: place.currentOpeningHours,
            formattedAddress: place.formattedAddress,
            hasOutdoorSeating: place.outdoorSeating || false,
            businessStatus: place.businessStatus,
            regularOpeningHours: place.regularOpeningHours,
            rating: place.rating,
            accessibilityOptions: place.accessibilityOptions,
            goodForGroups: place.goodForGroups,
            goodForChildren: place.goodForChildren,
            priceLevel: place.priceLevel,
            allowsDogs: place.allowsDogs,
            reservable: place.reservable,
            websiteUri: place.websiteUri,
        };

        return new Response(JSON.stringify(parsed), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (err) {
        return error(500, "Internal server error");
    }
}

const error = (statusCode, message) => {
    return new Response(JSON.stringify({ error: message }), {
        status: statusCode,
        headers: { "Content-Type": "application/json" },
    });
};
