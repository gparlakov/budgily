const invalidDate = new Date('Invalid dddate').toString();

export function validDateString(o?: string): boolean {
  return o != null && new Date(o).toString() != invalidDate;
}
