import { group, index } from 'd3';
import { getXmls } from './get-xml';
import { Movement, MovementType } from './types';

export type DSKAccountMovement = {
  ValueDate: string;
  Reason: string;
  OppositeSideName: string;
  OppositeSideAccount: string;
  MovementType: MovementType;
  Amount: string;
};


export interface DSKExport {
  AccountMovements: {
    AccountMovement: DSKAccountMovement[];
  };
}
export function defaultDSKMapper(x?: DSKExport): Movement[] {
  return (x?.AccountMovements?.AccountMovement??[])
  .map(v => {

    const [day, month, year] = v.ValueDate.split('.');
    const date = new Date(Number(year), Number(month) - 1, Number(day));

    if (date.toString() === new Date('Invalid date').toString()) {
      throw new Error(`could not parse ${m.ValueDate}`);
    }

    const amount = parseFloat(v.Amount.replace(',', '.'));

    return {
      date,
      oppositeSideName: v.OppositeSideAccount,
      type: v.MovementType,
      amount
    }
  })
}

export function getDskReports(fileNamePath: string[], mapper: (x?: DSKExport) => Movement[] = defaultDSKMapper): Promise<Movement[]> {
  return Promise.all(fileNamePath.map(f => getXmls<DSKExport>(f)))
    .then(exports => exports.flatMap(mapper))
    .then(all => {
      const groups = group(all, a => `${a.amount}-${a.date.toString()}`); // group by date and amount to remove duplications

      return [...groups.values()].map(v => v[0]);
    })
}

export function getDSKReportFiles(location: Location): string[] {
  return ['report-2022.xml', 'report-01_2022-04-2023.xml'].map(v => {
    const u = new URL(location.toString());
    u.pathname = v;
    return u.toString();
  });
}
