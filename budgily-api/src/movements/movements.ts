import { isValidDate } from '../core/is-valid-date';
import { Movement, MovementsQueryResponse, QueryResolvers, dedupe, defaultDSKMapper } from '@codedoc1/budgily-data';
import { dskMovements } from '../dsk/dsk-movements';
import { filterValueAllCategories, filterValueNoCategory } from 'budgily-data/src/lib/core/types';
import { getAllCategories } from '../categories/categories';

type Filter = (m: Movement) => boolean;

const sortableString: Array<keyof Movement> = ['account', 'description', 'opposite', 'type'];
const sortableNumb: Array<keyof Movement> = ['amount', 'date'];

export function getMovements(mapper = defaultDSKMapper, dedupeCB?: typeof dedupe): QueryResolvers['movements'] {
  const dedup = typeof dedupeCB === 'function' ? dedupeCB : dedupe;
  return (_: unknown, args) => {
    const { id, amountMax, amountMin, fromDate, search, toDate, categories } = args.filter ?? {};
    const { currentPage, pageCount } = args.pagination ?? {};
    const { field, desc } = args.sort ?? {};

    const passThrough = () => true;
    const idFilter = Array.isArray(id) ? (m: Movement) => id.includes(m.id) : passThrough;

    const amountMinFilter = amountMin > 0 ? (m: Movement) => m.amount >= amountMin : passThrough;
    const amountMaxFilter = amountMax > 0 ? (m: Movement) => m.amount <= amountMax : passThrough;

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
          (isCategory && m.categories?.some((c) => cats.includes(c.id.toString())))
        );
      };
    }

    return (
      dskMovements()
        .then((fs) => fs.flatMap(mapper))
        .then((ms) => {
          // include cats so we can filter by them
          const cats = getAllCategories() ?? [];
          return ms.map((m) => {
            m.categories = cats
              .filter((c) => c.movementIds.includes(m.id))
              .map(({ id, name }) => ({ id, name, movementIds: [] }));
            return m;
          });
        })
        // .then(ms => {
        //   if(typeof field === 'string') {
        //     // if(sortableString.includes(field as keyof Movement)) {
        //     //   const sorter = field === ''

        //     //   return ms.sort((a, b) => a[field]?.)
        //     // }

        //   }

        //   return ms;
        // })
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
        .then(dedup)
        .then((r) => {
          return { movements: r, sort: args.sort, page: {currentPage: 1, pageCount: 1, totalCount: r.length, count: r.length} } as MovementsQueryResponse;
        })
    );
  };
}
