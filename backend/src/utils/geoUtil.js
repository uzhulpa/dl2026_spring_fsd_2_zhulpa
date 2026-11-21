import MATH_CONSTANTS from "./math/constants.js";

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

export function haversineDistance(point1, point2) {
    const { EARTH_RADIUS_KM } = MATH_CONSTANTS;
    
    const lat1 = toRadians(point1.latitude);
    const lat2 = toRadians(point2.latitude);
    const deltaLat = toRadians(point2.latitude - point1.latitude);
    const deltaLon = toRadians(point2.longitude - point1.longitude);
    
    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return EARTH_RADIUS_KM * c;
}

export function getEffectiveDistance(clickPoint, correctPoint, questionType, radiusMeters) {
    const distanceKm = haversineDistance(clickPoint, correctPoint);
    
    if (questionType === 'point') {
        return distanceKm;
    }
    
    if (questionType === 'point_with_radius' && radiusMeters !== null) {
        const radiusKm = radiusMeters / 1000;
        
        if (distanceKm <= radiusKm) {
            return 0;
        }
        
        return distanceKm - radiusKm;
    }
    
    return distanceKm;
}