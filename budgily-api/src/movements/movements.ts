import { isValidDate } from '../core/is-valid-date';
import { appendCategories } from '../categories/categories';
import { Movement, QueryResolvers, dedupe, defaultDSKMapper } from '@codedoc1/budgily-data';
import { dskMovements } from '../dsk/dsk-movements';

type Filter = (m: Movement) => boolean;

export function getMovements(mapper = defaultDSKMapper, dedupeCB?: typeof dedupe): QueryResolvers['movements'] {
  return (_: unknown, args) => {
    const dedup = typeof dedupeCB === 'function' ? dedupeCB : dedupe;
    const { id, amountMax, amountMin, fromDate, search, toDate } = args.filter ?? {};
    const passThrough = () => true;
    const idFilter = Array.isArray(id) ? (m: Movement) => id.includes(m.id) : passThrough;

    const amountMinFilter = amountMin > 0 ? (m: Movement) => m.amount >= amountMin : passThrough;
    const amountMaxFilter = amountMax > 0 ? (m: Movement) => m.amount <= amountMax : passThrough;

    let fromDateFilter: Filter = passThrough;
    if (isValidDate(fromDate)) {
      const parsedFromDate = Date.parse(fromDate).valueOf();
      fromDateFilter = (m: Movement) => Date.parse(m.date).valueOf() > parsedFromDate;
    }

    let toDateFilter: Filter = passThrough;
    if (isValidDate(toDate)) {
      const parsedToDate = Date.parse(toDate).valueOf();
      toDateFilter = (m: Movement) => Date.parse(m.date).valueOf() < parsedToDate;
    }

    let searchFilter: Filter = passThrough;
    if (typeof search === 'string') {
      const r = new RegExp(search);
      searchFilter = (m) => r.test(m.raw);
    }

    return dskMovements()
      .then((fs) => fs.flatMap(mapper))
      .then((ms) =>
        ms
          .filter(idFilter)
          .filter(amountMinFilter)
          .filter(amountMaxFilter)
          .filter(fromDateFilter)
          .filter(toDateFilter)
          .filter(searchFilter)
      )
      .then(dedup)
      .then(appendCategories);
  };
}
