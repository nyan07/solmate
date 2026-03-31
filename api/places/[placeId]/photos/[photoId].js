export const config = {
  runtime: "edge",
};

export async function GET(req) {
  const abortController = new AbortController();

  req.signal.addEventListener('abort', () => {
    abortController.abort();
  });

  try {
    const requestUrl = new URL(req.url, `http://${req.headers.get("host")}`);

    // URL is /api/places/{placeId}/photos/{photoId}
    // photo.name from Google is already `places/{placeId}/photos/{photoId}`
    const resourceName = requestUrl.pathname.replace(/^\/api\//, "");

    if (!resourceName) {
      return error(400, "Resource name is not defined");
    }

    const maxWidthPx = requestUrl.searchParams.get("w") || 400;
    const maxHeightPx = requestUrl.searchParams.get("h") || 400;

    const origin = req.headers.get("origin") || "";
    const host = req.headers.get("host") || "";

    const url = `https://places.googleapis.com/v1/${resourceName}/media?maxHeightPx=${maxHeightPx}&maxWidthPx=${maxWidthPx}`;
    const response = await fetch(url, {
      signal: abortController.signal,
      headers: {
        "X-Goog-Api-Key": process.env.GOOGLE_PLACES_KEY,
        "Referer": origin || `https://${host}`,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("Photo API error:", response.status, body, "\nURL:", url);
      return error(500, "Failed to fetch photo");
    }

    return new Response(await response.arrayBuffer(), {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400",
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