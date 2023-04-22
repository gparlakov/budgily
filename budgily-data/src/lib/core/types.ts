export type MovementType = 'Debit' | 'Credit'

export interface Movement {
  date: Date;
  amount: number;
  type: MovementType;
  description: string;
}
