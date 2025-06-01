const convertToRGB = (color: number[]): string => {
  console.log(color);
  return `rgb${color.length === 4 ? "a" : ""}(${color.join(", ")})`;
};

export default convertToRGB;
