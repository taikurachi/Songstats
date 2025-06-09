const convertToRGB = (color: number[]): string => {
  if (!color) return "rgb(138,0,196)";
  return `rgb${color.length === 4 ? "a" : ""}(${color.join(", ")})`;
};

export default convertToRGB;
