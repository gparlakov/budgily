
const invalidDate = new Date('invalid').toString();
export function isValidDate(d: string | Date): boolean {
  return (d != null && typeof d === 'object' && 'getUTCDate' in d) ||
  (typeof d === 'string' && Date.parse(d).toString() != invalidDate);
}
