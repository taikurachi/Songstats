const convertToColorArr = (dominantColor: string): number[] => {
  return dominantColor.match(/\d+/g)?.map(Number) || [128, 128, 128];
};
export default convertToColorArr;
