import MATH_CONSTANTS from "./constants.js";

const { MAX_DISTANCE_KM, ACCURACY_DECAY_FACTOR } = MATH_CONSTANTS;

export function getAccuracyMultiplier(distanceKm) {
    if (distanceKm <= 0) {
        return 1.0;
    }
    
    if (distanceKm >= MAX_DISTANCE_KM) {
        return 0.0;
    }
    
    // accuracy = e^(-distance / maxDistance * decayFactor)
    const exponent = -(distanceKm / MAX_DISTANCE_KM) * ACCURACY_DECAY_FACTOR;
    const accuracy = Math.exp(exponent);
    
    return Math.max(0, Math.min(1, accuracy));
}

export function getAccuracyScore(distanceKm, maxScore) {
    const multiplier = getAccuracyMultiplier(distanceKm);
    return Math.floor(maxScore * multiplier);
}