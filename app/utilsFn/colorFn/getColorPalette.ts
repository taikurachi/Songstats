import convertToRGB from "./convertToRGB";
import changeColor from "./convertColor";
import checkLuminance from "./checkLuminance";
import convertToColorArr from "./convertToColorArr";

const getColorPalette = (dominantColor: string): string => {
  const dominantColorArr = convertToColorArr(dominantColor);

  return `linear-gradient(180deg, ${dominantColor},${convertToRGB(
    changeColor(dominantColorArr, checkLuminance(dominantColorArr) ? 50 : -100)
  )})`;
};

export default getColorPalette;
