import { http, HttpResponse } from "msw";
import type { Place, PlaceSummary } from "@/features/places/types";

export const mockPlace: Place = {
    id: "place-1",
    displayName: "Test Café",
    primaryType: "cafe",
    primaryTypeDisplayName: "Café",
    editorialSummary: "A great place to work.",
    location: { latitude: 48.8566, longitude: 2.3522 },
    hasOutdoorSeating: true,
    photoUrl: "https://example.com/photo.jpg",
    businessStatus: "OPERATIONAL",
};

export const mockPlaceSummary: PlaceSummary = {
    id: "place-1",
    displayName: "Test Café",
    primaryType: "cafe",
    editorialSummary: "A great place to work.",
    location: { latitude: 48.8566, longitude: 2.3522 },
    hasOutdoorSeating: true,
    photoUrl: "https://example.com/photo.jpg",
};

export const handlers = [
    http.get("/api/places/:id", ({ params }) => {
        if (params.id === "not-found") {
            return new HttpResponse(null, { status: 404 });
        }
        return HttpResponse.json({ ...mockPlace, id: params.id });
    }),

    http.post("/api/places/nearby", () => {
        return HttpResponse.json([mockPlaceSummary]);
    }),
];
