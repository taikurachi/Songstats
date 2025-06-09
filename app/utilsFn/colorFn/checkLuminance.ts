const checkLuminance = (color: number[]): boolean => {
  console.log(color, "this is color");
  return (0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2]) / 255 < 0.46;
};

export default checkLuminance;
