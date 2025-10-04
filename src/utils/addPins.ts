import { Cartesian2, Cartesian3, Color, Viewer } from "cesium";
import type { PlaceSummary } from "../places/types/PlaceSummary";

export const addEstablishmentPins = (viewer: Viewer, places: PlaceSummary[], offsetHeight: number = 0) => {
    if (!viewer || !places || places.length === 0) return;

    places.forEach(place => {
        // Checa se já existe o pin
        let entity = viewer.entities.getById(place.id);
        if (!entity) {
            entity = viewer.entities.add({
                id: place.id,
                position: Cartesian3.fromDegrees(place.location.longitude, place.location.latitude, offsetHeight),
                point: {
                    pixelSize: 10,
                    color: Color.RED,
                    outlineColor: Color.WHITE,
                    outlineWidth: 2,
                },
                label: {
                    text: place.displayName,
                    font: "14px sans-serif",
                    fillColor: Color.WHITE,
                    style: 1,
                    outlineColor: Color.BLACK,
                    outlineWidth: 2,
                    verticalOrigin: 1,
                    pixelOffset: new Cartesian2(0, -20),
                },
            });
        }
    });
};
