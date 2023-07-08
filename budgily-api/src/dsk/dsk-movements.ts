/* eslint-disable @typescript-eslint/ban-ts-comment */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import { csvParse } from 'd3';

// @ts-ignore
import report from './report-2022.xml';
// @ts-ignore
import report1 from './report-01_2022-04-2023.xml';
// @ts-ignore
import report2 from './report-11_2021-11_2022.xml';
// @ts-ignore
import report3 from './report-2020-debit-card-income.csv';

const parser = new XMLParser({
  unpairedTags: ['br', 'hr'],
  stopNodes: ['*.br'],
  textNodeName: '$_text',
});

// essentially - load the files once in memory and keep as long as app is alive
// TODO - error handling and retries
const filesPromise = [report, report1, report2, report3].map((file) =>
  readFile(`./${new URL(file, import.meta.url).pathname}`).then((x) => (file.endsWith('xml') ? parser.parse(x) : csvParse(x.toString())))
);

export function dskMovements() {
  return Promise.all(filesPromise);
}
