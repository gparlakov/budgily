import { csv, group } from 'd3';
import { getXmls } from './get-xml';
import { DSKExport, defaultDSKMapper } from '../dsk/dsk-handler';
import { Movement } from '@codedoc1/budgily-data';

export interface ClientContext {
  uri: string;
  name: string;
  version: string;
}


export const dedupe = (all: Movement[]): Movement[] => {
  // group by date,amount, and type to remove duplications from multiple files i.e. same debit reported from multiple files
  const groups = group(all, (a) => `${a.amount}-${a.date?.toString()}-${a.type}`);
  return [...groups.values()].map((v) => v[0]);
};
export function getDskReports(
  files: string[],
  mapper: (x?: DSKExport) => Movement[] = defaultDSKMapper
): Promise<Movement[]> {

  return Promise.all(
    files.map((f) => f.endsWith('xml') ? getXmls<DSKExport>(f) : csv(f) as Promise<DSKExport>)
  )
    .then((exports) => exports.flatMap(mapper))
    .then(dedupe);
}

export function getDskReportsV2(clientContext: ClientContext, controller?: AbortController): Promise<Movement[]> {
  return fetch(
    clientContext.uri,
    {
      method: "POST",
      headers: {
        // "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: `{
        query GetAllMovements {
          movements {
            date,
            amount,
            description,
            type
          }
        }
      }`,
      signal: controller?.signal
    })
      .then(r => r.json() as Promise<Movement[]>)

}

export function getDSKReportFiles(location: Location): string[] {
  return [
    'report-2022.xml',
    'report-01_2022-04-2023.xml',
    'report-11_2021-11_2022.xml',
    'report-2020-debit-card-income.csv',
  ].map((v) => {
    const u = new URL(location.toString());
    u.pathname = v;
    return u.toString();
  });
}
