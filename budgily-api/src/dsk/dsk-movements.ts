/* eslint-disable @typescript-eslint/ban-ts-comment */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import { csvParse } from 'd3';
import {
  Movement,
  MovementFilter,
  MovementResolvers,
  QueryResolvers,
  dedupe,
  defaultDSKMapper,
} from '@codedoc1/budgily-data';

// @ts-ignore
import report from './report-2022.xml';
// @ts-ignore
import report1 from './report-01_2022-04-2023.xml';
// @ts-ignore
import report2 from './report-11_2021-11_2022.xml';
// @ts-ignore
import report3 from './report-2020-debit-card-income.csv';
import { isValidDate } from '../core/is-valid-date';

type Filter = (m: Movement) => boolean;

const parser = new XMLParser({
  unpairedTags: ['br', 'hr'],
  stopNodes: ['*.br'],
  textNodeName: '$_text',
});

// essentially - load the files once in memory and keep as long as app is alive
// TODO - error handling and retries
const filesPromise = [report, report1, report2, report3].map((file) =>
  readFile(join(__dirname, file)).then((x) => (file.endsWith('xml') ? parser.parse(x) : csvParse(x.toString())))
);

export function getDskMovements(mapper = defaultDSKMapper, dedupeCB?: typeof dedupe): QueryResolvers['movements'] {
  return (_: unknown, args: { filter: MovementFilter }) => {
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

    return Promise.all(filesPromise)
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
      .then(dedup);
  };
}
