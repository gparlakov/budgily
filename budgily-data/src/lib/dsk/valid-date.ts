const invalidDate = new Date('Invalid dddate').toString();

export function validDateString(o: string): boolean {
  return new Date(o).toString() != invalidDate;
}
