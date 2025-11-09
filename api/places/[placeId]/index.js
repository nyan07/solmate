export const config = {
    runtime: "edge",
  };
  
  const parseUrl = (url) => {
      const parts = url.pathname.split("/");
    
      const placeId = parts[3];
    
      if (placeId) {
        return { placeId };
      }
  }
  
  export async function GET(req) {
    const abortController = new AbortController();
  
    req.signal.addEventListener('abort', () => {
      abortController.abort();
    });
  
    try {
      const requestUrl = new URL(req.url, `http://${req.headers.host}`);
      const {placeId} = parseUrl(requestUrl);
  
      if (!placeId) {
        return error("PlaceId is not defined");
      }

      const fields = [
        "id",
        "displayName",
        "primaryType",
        "editorialSummary",
        "location",
        "photos",
        "currentOpeningHours",
        "formattedAddress",
        "outdoorSeating",
        "businessStatus",
        "regularOpeningHours",
        "rating",
        "businessStatus",
        "accessibilityOptions",
        "goodForGroups",
        "isGoodForChildren",
        "priceLevel",
        "allowsDogs"
      ];
  
      const url = `https://places.googleapis.com/v1/places/${placeId}/?key=${process.env.GOOGLE_PLACES_KEY}`;
      const response = await fetch(url, { signal: abortController.signal });
  
      if (!response.ok) {
        return error(500, `Failed to fetch: ${response.error}`);
      }
  
      return new Response(await response.arrayBuffer(), {
        status: 200,
        headers: {
          "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
          "Cache-Control": "public, max-age=86400",
          "X-Goog-FieldMask": fields.map((f) => `places.${f}`).join(","),
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
  }