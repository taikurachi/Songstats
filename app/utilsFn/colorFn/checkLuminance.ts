const checkLuminance = (color: number[]): boolean => {
  // Add defensive check for undefined or invalid color
  if (!color || !Array.isArray(color) || color.length < 3) {
    console.warn("Invalid color provided to checkLuminance, using default");
    return false; // Default to light theme if color is invalid
  }

  // Calculate relative luminance using the ITU BT.709 formula
  const luminance =
    (0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2]) / 255;

  // Use 0.5 threshold for better consistency across devices
  // and add a slight bias toward white text for better readability
  return luminance < 0.5;
};

export default checkLuminance;
