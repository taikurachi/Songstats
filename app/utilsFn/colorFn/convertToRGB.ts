const convertToRGB = (color: number[]): string => {
  return `rgb${color.length === 4 ? "a" : ""}(${color.join(", ")})`;
};

export default convertToRGB;
