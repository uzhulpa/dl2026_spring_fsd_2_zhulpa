import MATH_CONSTANTS from "./constants.js";

const { MIN_TIME_SEC, MAX_TIME_SEC } = MATH_CONSTANTS;

export function getAllowedTimeSeconds(difficulty) {
    const allowedTime = MIN_TIME_SEC + (MAX_TIME_SEC - MIN_TIME_SEC) * ((difficulty - 1) / 9);
    
    return allowedTime;
}

export function getAllowedTimeMs(difficulty) {
    return getAllowedTimeSeconds(difficulty) * 1000;
}

export function getNormalizedTime(responseTimeMs, difficulty) {
    const allowedTimeMs = getAllowedTimeMs(difficulty);
    
    if (responseTimeMs >= allowedTimeMs) {
        return 1;
    }
    
    return responseTimeMs / allowedTimeMs;
}