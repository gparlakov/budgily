const invalidDate = new Date('Invalid dddate').toString();

export function validDateString(o?: string): o is string {
  return o != null && new Date(o).toString() != invalidDate;
}
