
export type MovementVm = {
  categories: Array<{ name: string }>;
  amount: number;
  description: string;
  date: Date;
  type: 'Credit' | 'Debit';
  id: string;
  month: string;
};

export type MovementWithCoordinates = MovementVm & {
  coord: {
    x: number;
    y: number;
    width: string;
    height: string;
    fill: string;
    stroke: string;
  };
};


export interface CategoryVM {
  id: string;
  name: string;
  description?: string;
}
