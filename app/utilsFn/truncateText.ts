export const truncateText = (text: string, length: number): string =>
  text.length > length ? text.slice(0, length) + "..." : text;

export default truncateText;
