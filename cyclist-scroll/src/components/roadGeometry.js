export const ROAD_WIDTH = 8000;
export const ROAD_VIEW_WIDTH = 400;
export const ROAD_SEGMENTS = 120;

export function roadOffset(index) {
  return Math.sin(index * 0.4) * 40
    + Math.sin(index * 0.15) * 30
    + Math.cos(index * 0.7) * 20;
}

// Matches the quadratic segments that make up the visible road.
export function getRoadPosition(worldX) {
  const segmentWidth = ROAD_WIDTH / ROAD_SEGMENTS;
  const clampedX = Math.min(Math.max(worldX, 0), ROAD_WIDTH);
  const segment = Math.min(Math.floor(clampedX / segmentWidth), ROAD_SEGMENTS - 1);
  const progress = Math.min((clampedX - segment * segmentWidth) / segmentWidth, 1);
  const startY = 245 + roadOffset(segment);
  const endY = 245 + roadOffset(segment + 1);
  const controlY = 245 + (roadOffset(segment) + roadOffset(segment + 1)) / 2 - 10;
  const inverseProgress = 1 - progress;
  const y = inverseProgress ** 2 * startY
    + 2 * inverseProgress * progress * controlY
    + progress ** 2 * endY;
  const slope = (2 * inverseProgress * (controlY - startY)
    + 2 * progress * (endY - controlY)) / segmentWidth;

  return { y, angle: Math.atan(slope) * (180 / Math.PI) };
}
