import { isValidDate } from '../core/is-valid-date';
import { Movement, QueryResolvers, dedupe, defaultDSKMapper } from '@codedoc1/budgily-data';
import { dskMovements } from '../dsk/dsk-movements';
import { filterValueAllCategories, filterValueNoCategory } from 'budgily-data/src/lib/core/types';

type Filter = (m: Movement) => boolean;

export function getMovements(mapper = defaultDSKMapper, dedupeCB?: typeof dedupe): QueryResolvers['movements'] {
  return (_: unknown, args) => {
    const dedup = typeof dedupeCB === 'function' ? dedupeCB : dedupe;
    const { id, amountMax, amountMin, fromDate, search, toDate, categories } = args.filter ?? {};
    const passThrough = () => true;
    const idFilter = Array.isArray(id) ? (m: Movement) => id.includes(m.id) : passThrough;

    const amountMinFilter = amountMin > 0 ? (m: Movement) => m.amount >= amountMin : passThrough;
    const amountMaxFilter = amountMax > 0 ? (m: Movement) => m.amount <= amountMax : passThrough;

    let fromDateFilter: Filter = passThrough;
    if (isValidDate(fromDate)) {
      const parsedFromDate = Date.parse(fromDate);
      fromDateFilter = (m: Movement) => parseInt(m.date) > parsedFromDate
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
    if(Array.isArray(categories) && categories.filter(c => c != filterValueAllCategories).length > 0) {
      const isAll = categories.includes(filterValueAllCategories);
      const isNone = categories.includes(filterValueNoCategory);

      const cats = categories.filter(c => c != filterValueAllCategories && c != filterValueNoCategory);
      const isCategory = cats.length > 0;
      categoryFilter = (m) => {
         return ((m.categories == null || m.categories.length === 0) && (isNone || isAll)) ||
          (isCategory && m.categories?.some(c => cats.includes(c.id.toString())))
      }
    }

    return dskMovements()
      .then((fs) => fs.flatMap(mapper))
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
      ;
  };
}
