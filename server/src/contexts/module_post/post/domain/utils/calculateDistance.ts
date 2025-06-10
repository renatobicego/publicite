import { UserLocation } from "../entity/models_graphql/HTTP-REQUEST/post.location.request";


interface PostLocationCoordinate {
    coordinates: [number, number];
}
export function calculateDistance(userLocation: UserLocation, postLocationCoordinate: PostLocationCoordinate): Number {
    const EARTH_RADIUS_METERS = 6371000;
    const latitude1 = userLocation.latitude;
    const latitude2 = postLocationCoordinate.coordinates[0];
    const longitude1 = userLocation.longitude;
    const longitude2 = postLocationCoordinate.coordinates[1];

    const latitude1InRadians = latitude1 * Math.PI / 180;
    const latitude2InRadians = latitude2 * Math.PI / 180;
    const deltaLatitudeInRadians = (latitude2 - latitude1) * Math.PI / 180;
    const deltaLongitudeInRadians = (longitude2 - longitude1) * Math.PI / 180;

    const a = Math.sin(deltaLatitudeInRadians / 2) * Math.sin(deltaLatitudeInRadians / 2) +
        Math.cos(latitude1InRadians) * Math.cos(latitude2InRadians) *
        Math.sin(deltaLongitudeInRadians / 2) * Math.sin(deltaLongitudeInRadians / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = EARTH_RADIUS_METERS * c;

    return distance;
}   



