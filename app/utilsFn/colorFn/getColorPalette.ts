import convertToRGB from "./convertToRGB";
import changeColor from "./changeColor";
import checkLuminance from "./checkLuminance";
const getColorPalette = (dominantColor: number[]): string => {
  return `linear-gradient(180deg, ${convertToRGB(
    dominantColor
  )}, ${convertToRGB(
    changeColor(dominantColor, checkLuminance(dominantColor) < 0.46 ? 50 : -100)
  )} )`;
};

export default getColorPalette;
