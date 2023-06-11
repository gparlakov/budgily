import { NoSerialize } from "@builder.io/qwik";
import { CategoryVM, MovementVm } from "./movement.types";

export interface AppStore {
    selectedId?: string;
    movements: NoSerialize<MovementVm[]>;
    maxSum: number;
    months: string[];
    allCategories: NoSerialize<CategoryVM[]>;
    filter: {
      categories: string[];
      fromDate?: Date;
    };
    next?: NoSerialize<() => void>;
    previous?: NoSerialize<() => void>
  }
  