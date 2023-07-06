export type Categorize = {
  category?: CategoryInput;
  categoryId?: number;
  movementIds: Array<string>;
};

export type Category = {
  description?: string;
  id: number;
  movementIds: Array<string>;
  name: string;
};

export type CategoryInput = {
  description: string;
  name: string;
};

export type Movement = {
  account?: string;
  amount: number;
  categories?: Array<Category>;
  date: string;
  description: string;
  id: string;
  opposite?: string;
  raw: string;
  type: MovementType;
};

export type MovementFilter = {
  amountMax?: number;
  amountMin?: number;
  categories?: Array<string>;
  fromDate?: string;
  id?: Array<string>;
  search?: string;
  toDate?: string;
};

export enum MovementType {
  Credit = 'CREDIT',
  Debit = 'DEBIT',
}

export type MovementsQueryResponse = {
  movements: Array<Movement>;
  page: Pagination;
  sort?: Sort;
};

export type Mutation = {
  categorize?: Category;
};

export type MutationCategorizeArgs = {
  input?: Categorize;
};

export type Pagination = {
  count: number;
  currentPage: number;
  pageCount: number;
  totalCount: number;
};

export type PaginationInput = {
  currentPage?: number;
  pageCount?: number;
};

export type QueryMovementsArgs = {
  filter?: MovementFilter;
  pagination?: PaginationInput;
  sort?: SortInput;
};

export type Sort = {
  desc?: boolean;
  field: string;
};

export type SortInput = {
  desc?: boolean;
  field: string;
};
