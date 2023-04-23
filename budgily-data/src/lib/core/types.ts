export type MovementType = 'Debit' | 'Credit'


export interface Movement {
  date: string;
  amount: number;
  type: MovementType;
  description: string;
  // raw?: Record<string, unknown>
}
