import MATH_CONSTANTS from "./constants.js";
import { getEffectiveDistance } from "../geoUtil.js";
import { getAccuracyMultiplier, getAccuracyScore } from './accuracy.js';
import { getSpeedMultiplier, getSpeedScore } from './speed.js';
import { getAllowedTimeMs, getAllowedTimeSeconds, getNormalizedTime } from './time.js';

const { MAX_SCORE } = MATH_CONSTANTS;

export function calculateScore(params) {
    const {
        clickPoint,
        correctPoint,
        questionType,
        radiusMeters,
        responseTimeMs,
        difficulty,
        maxScore = MAX_SCORE
    } = params;
    
    const distanceKm = getEffectiveDistance(
        clickPoint,
        correctPoint,
        questionType,
        radiusMeters
    );
    
    const accuracyMultiplier = getAccuracyMultiplier(distanceKm);
    const speedMultiplier = getSpeedMultiplier(responseTimeMs, difficulty);
    
    let totalMultiplier = accuracyMultiplier + speedMultiplier;
    totalMultiplier = Math.min(1.3, totalMultiplier);
    
    let score = Math.floor(maxScore * totalMultiplier);
    score = Math.max(0, score);
    
    const breakdown = {
        max_score: maxScore,
        accuracy: {
            multiplier: parseFloat(accuracyMultiplier.toFixed(4)),
            score: Math.floor(maxScore * accuracyMultiplier)
        },
        speed: {
            multiplier: parseFloat(speedMultiplier.toFixed(4)),
            score: Math.floor(maxScore * speedMultiplier),
            allowed_time_seconds: getAllowedTimeSeconds(difficulty),
            normalized_time: parseFloat(getNormalizedTime(responseTimeMs, difficulty).toFixed(4))
        },
        total_multiplier: parseFloat(totalMultiplier.toFixed(4))
    };
    
    return {
        score_awarded: score,
        distance_km: parseFloat(distanceKm.toFixed(2)),
        max_possible_score: Math.floor(maxScore * 1.3),
        breakdown
    };
}

export function calculateScoreSimple(params) {
    return calculateScore(params).score_awarded;
}

export {
    getAccuracyMultiplier,
    getSpeedMultiplier,
    getAllowedTimeSeconds,
    getAllowedTimeMs,
    getNormalizedTime
};