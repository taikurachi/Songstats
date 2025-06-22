export const lightenColor = (colorArr: number[]): number[] => {
  // Lighten the color by blending with white (30% lighter)
  const lighteningFactor = 0.3;

  return colorArr.map((channel) => {
    // Blend each channel with white (255) to lighten
    const lightenedValue = Math.floor(
      channel + (255 - channel) * lighteningFactor
    );
    return Math.max(0, Math.min(255, lightenedValue));
  });
};
