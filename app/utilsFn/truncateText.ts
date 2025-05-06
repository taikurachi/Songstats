export const truncateText = (text: string, length: number): string => {
  if (length === 0) return text;
  return text.length > length ? text.slice(0, length) + "..." : text;
};

export default truncateText;
