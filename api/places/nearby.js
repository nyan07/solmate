export const config = {
  runtime: "edge", // força rodar como Edge Function
};

const restaurants = [
  "restaurant",
  "afghani_restaurant",
  "african_restaurant",
  "american_restaurant",
  "asian_restaurant",
  "barbecue_restaurant",
  "brazilian_restaurant",
  "breakfast_restaurant",
  "brunch_restaurant",
  "buffet_restaurant",
  "chinese_restaurant",
  "dessert_restaurant",
  "diner",
  "fine_dining_restaurant",
  "french_restaurant",
  "greek_restaurant",
  "hamburger_restaurant",
  "indian_restaurant",
  "indonesian_restaurant",
  "italian_restaurant",
  "japanese_restaurant",
  "korean_restaurant",
  "lebanese_restaurant",
  "mediterranean_restaurant",
  "mexican_restaurant",
  "middle_eastern_restaurant",
  "pizza_restaurant",
  "ramen_restaurant",
  "restaurant",
  "seafood_restaurant",
  "spanish_restaurant",
  "steak_house",
  "sushi_restaurant",
  "thai_restaurant",
  "turkish_restaurant",
  "vegan_restaurant",
  "vegetarian_restaurant",
  "vietnamese_restaurant"
];

const cafes = [
  "cafe",
  "cafeteria",
  "cat_cafe",
  "coffee_shop"
];

const bars = [
  "bar",
  "pub",
  "wine_bar"
];

const mapDay = (day) => {
  const shifted = day + 1;
  return shifted > 7 ? 1 : shifted;
};

const toHHMM = (hour, minute) =>
  `${hour.toString().padStart(2, '0')}${minute
    .toString()
    .padStart(2, '0')}`;

function parseOpeningHours(openingHours) {
  if (!openingHours) return [];
  const { periods } = openingHours
  return periods.map(p => ({
    day: mapDay(p.open.day),
    from: toHHMM(p.open.hour, p.open.minute),
    until: toHHMM(p.close.hour, p.close.minute)
  }));
}

const parsePrimaryType = (type) => {
  if (restaurants.includes(type)) return "restaurant";
  if (cafes.includes(type)) return "cafe";
  if (bars.includes(type)) return "bar";
  return "unknown";
}

const parsePlace = (place) => {
  if (!place) return;
  let photoUrl;

  if (place.photos) {
    const [photo] = place.photos
    photoUrl = `/api/${photo.name}?w=200&h=200`
  }

  const result = {
    id: place.id,
    displayName: place.displayName?.text,
    primaryType: parsePrimaryType(place.primaryType),
    editorialSummary: place.editorialSummary?.text,
    location: place.location,
    hasOutdoorSeating: place.outdoorSeating || false,
    photoUrl,
    openingHours: parseOpeningHours(place.currentOpeningHours)
  }
  return result;
}

export default async function POST(request) {
  try {
    const body = await request.json();
    const { latitude, longitude, radius = 500 } = body;

    if (!latitude || !longitude) {
      return new Response(JSON.stringify({ error: "Missing latitude or longitude" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
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
      "outdoorSeating"
    ];

    const url = "https://places.googleapis.com/v1/places:searchNearby";
    const origin = request.headers.get("origin") || "";
    const host = request.headers.get("host") || "";

    const headers = {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": process.env.GOOGLE_PLACES_KEY,
      "X-Goog-FieldMask": fields.map((f) => `places.${f}`).join(","),
      "Referer": origin || `https://${host}`,
    };

    const requestBody = {
      includedPrimaryTypes: restaurants.concat(bars).concat(cafes),
      maxResultCount: 20,
      languageCode: "en",
      rankPreference: "DISTANCE",
      locationRestriction: {
        circle: {
          center: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
          },
          radius,
        },
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!data.places) {
      console.error("Places API error:", data);
      return new Response(JSON.stringify({ error: "Places API error", details: data }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const places = data.places.map(parsePlace);

    return new Response(JSON.stringify(places), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Error calling Places API:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
