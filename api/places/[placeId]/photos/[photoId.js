export const config = {
  runtime: "edge",
};

export async function GET(req) {
  const abortController = new AbortController();

  req.signal.addEventListener('abort', () => {
    console.log('request aborted');
    abortController.abort();
  });

  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    const regex = /\/api\/places\/([^/]+)\/photos\/([^/?#]+)/;
    const match = requestUrl.pathname.match(regex);

    const [, placeId, photoId] = match;

    if (!placeId || !photoId) {
      return error("PlaceId or PhotoId is not defined");
    }

    const { searchParams } = new URL(req.url);
    const maxWidthPx = searchParams.get("w") || 400;
    const maxHeightPx = searchParams.get("h") || 400;

    const url = `https://places.googleapis.com/v1/places/${placeId}/photos/${photoId}/media?maxHeightPx=${maxHeightPx}&maxWidthPx=${maxWidthPx}&key=${process.env.GOOGLE_PLACES_KEY}`;
    const response = await fetch(url, { signal: abortController.signal });

    if (!response.ok) {
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