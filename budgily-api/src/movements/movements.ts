import { isValidDate } from '../core/is-valid-date';
import { Movement, MovementsQueryResponse, QueryResolvers } from '@codedoc1/budgily-data';

import { filterValueAllCategories, filterValueNoCategory } from 'budgily-data/src/lib/core/types';
import { getAllCategories } from '../categories/categories';

type Filter = (m: Movement) => boolean;

const sortableString: Array<keyof Movement> = ['account', 'description', 'opposite', 'type'];

let getAllMovements: () => Promise<Movement[]>;

async function loadMovements(): Promise<Movement[]> {
  const db = process.env.BUDGILY_DB_FILE ?? './db.json';
  if(typeof getAllMovements != 'function') {
    getAllMovements = await import('fs/promises').then(fs => {
      return () => fs.readFile(db).then(v=> JSON.parse(v.toString()) as Movement[]);
    });
  }

  return getAllMovements();

}

export function getMovements(): QueryResolvers['movements'] {

  return (_: unknown, args) => {
    const { id, amountMax, amountMin, fromDate, search, toDate, categories } = args.filter ?? {};
    const { currentPage, pageCount: perPage } = args.pagination ?? {};
    const { field, desc } = args.sort ?? {};

    const passThrough = () => true;
    const idFilter = Array.isArray(id) ? (m: Movement) => id.includes(m.id) : passThrough;

    const amountMinFilter = Number(amountMin) > 0 ? (m: Movement) => m.amount >= Number(amountMin) : passThrough;
    const amountMaxFilter = Number(amountMax) > 0 ? (m: Movement) => m.amount <= Number(amountMax) : passThrough;

    let fromDateFilter: Filter = passThrough;
    if (isValidDate(fromDate)) {
      const parsedFromDate = Date.parse(fromDate);
      fromDateFilter = (m: Movement) => parseInt(m.date) > parsedFromDate;
    }

    let toDateFilter: Filter = passThrough;
    if (isValidDate(toDate)) {
      const parsedToDate = Date.parse(toDate);
      toDateFilter = (m: Movement) => parseInt(m.date) < parsedToDate;
    }

    let searchFilter: Filter = passThrough;
    if (typeof search === 'string') {
      const r = new RegExp(search);
      searchFilter = (m) => r.test(m.raw);
    }

    let categoryFilter: Filter = passThrough;
    if (Array.isArray(categories) && categories.filter((c) => c != filterValueAllCategories).length > 0) {
      const isAll = categories.includes(filterValueAllCategories);
      const isNone = categories.includes(filterValueNoCategory);

      const cats = categories.filter((c) => c != filterValueAllCategories && c != filterValueNoCategory);
      const isCategory = cats.length > 0;

      categoryFilter = (m) => {
        return (
          isAll ||
          (isNone && (m.categories == null || m.categories.length === 0)) ||
          (isCategory && (m.categories?.some((c) => cats.includes(c.id?.toString())) ?? false))
        );
      };
    }

    return loadMovements()
      .then(async (ms) => {
        // include cats so we can filter by them
        const cats = await getAllCategories() ?? [];
        return ms.map((m) => {
          m.categories = cats
            .filter((c) => c.movementIds.includes(m.id))
            .map(({ id, name }) => ({ id, name, movementIds: [] }));
          return m;
        });
      })
      .then((ms) =>
        ms
          .filter(idFilter)
          .filter(amountMinFilter)
          .filter(amountMaxFilter)
          .filter(categoryFilter)
          .filter(fromDateFilter)
          .filter(toDateFilter)
          .filter(searchFilter)
      )
      .then((ms) => {
        let sorter: ((a: Movement, b: Movement) => number) | undefined = undefined;

        if(sortableString.includes(field as keyof Movement)) {
          sorter = (a: Movement, b: Movement) => a[field] == null ? b[field] == null ? 0 : -1 : (a[field]!).localeCompare(b[field]!);
        }

        if(field === 'amount') {
          sorter = (a: Movement, b: Movement) => a.amount == null ? b.amount == null ? 0 : -1 : a.amount - b.amount;
        }

        if(field === 'date') {
          sorter = (a, b) => !isValidDate(a.date) ? !isValidDate(b.date) ? 0 : -1 : Number(a.date) - Number(b.date)
        }

        return typeof sorter === 'function' ?  ms.sort((a, b) => desc ? sorter(b, a) : sorter(a, b)) : ms;
      })
      .then((r) => {
        const results = r.length ?? 0;
        const zeroBasedPage = Number(currentPage) - 1 < 0 ? 0 : Number(currentPage) - 1;

        const itemsPerPage = perPage != null && Number(perPage) > 0 && Number(perPage) < results ? Number(perPage) : results;
        const currentPageNumber = results > 0 && perPage * zeroBasedPage < results ? zeroBasedPage + 1 : 1;
        const countReturning = itemsPerPage * currentPageNumber < results ? itemsPerPage : results - (itemsPerPage * (currentPageNumber - 1));

        const startIndex = (currentPageNumber - 1 ) * itemsPerPage;
        const endIndex = startIndex + countReturning + 1;

        return {
          movements: r.slice(startIndex, endIndex),
          sort: args.sort,
          page: { currentPage: currentPageNumber, pageCount: itemsPerPage, totalCount: results, count: countReturning },
        } as MovementsQueryResponse;
      });
  };
}
