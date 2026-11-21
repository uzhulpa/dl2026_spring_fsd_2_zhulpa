import MATH_CONSTANTS from "./constants.js";
import { getAllowedTimeMs, getNormalizedTime } from './time.js';

const { MAX_SPEED_BONUS } = MATH_CONSTANTS;

export function getSpeedMultiplier(responseTimeMs, difficulty) {
    const allowedTimeMs = getAllowedTimeMs(difficulty);
    
    if (responseTimeMs >= allowedTimeMs) {
        return 0;
    }
    
    // (1 - normalizedTime)^2
    const normalizedTime = getNormalizedTime(responseTimeMs, difficulty);
    const speedFactor = Math.pow(1 - normalizedTime, 2);
    
    return speedFactor * MAX_SPEED_BONUS;
}

export function getSpeedScore(responseTimeMs, difficulty, maxScore) {
    const multiplier = getSpeedMultiplier(responseTimeMs, difficulty);
    return Math.floor(maxScore * multiplier);
}