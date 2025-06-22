export const darkenColor = (colorArr: number[]): number[] => {
  // Darken the color by reducing each RGB channel by 30% (multiply by 0.7)
  const darkeningFactor = 0.7;

  return colorArr.map((channel) => {
    // Ensure the channel value is within 0-255 range and apply darkening
    const darkenedValue = Math.floor(channel * darkeningFactor);
    return Math.max(0, Math.min(255, darkenedValue));
  });
};
