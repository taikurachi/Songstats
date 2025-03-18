const checkLuminance = (color: number[]): number =>
  (0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2]) / 255;

export default checkLuminance;
