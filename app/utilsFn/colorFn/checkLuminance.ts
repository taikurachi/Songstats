const checkLuminance = (color: number[]): boolean => {
  // Add defensive check for undefined or invalid color
  if (!color || !Array.isArray(color) || color.length < 3) {
    console.warn("Invalid color provided to checkLuminance, using default");
    return false; // Default to light theme if color is invalid
  }

  return (0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2]) / 255 < 0.46;
};

export default checkLuminance;
