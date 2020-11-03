const lengthRegex = /(\d*\.?\d+)\s?(cm|mm|in|px|pt|pc|em|ex|ch|rem|vw|vh|vmin|vmax|%+)/i;

export default (val: string): boolean => {
  const result = val.match(lengthRegex)
  return result !== null && result.length <= 3;
}