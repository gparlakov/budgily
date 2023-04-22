import { csv, group, xml } from 'd3';
import { Movement, MovementType } from '../core/types';
import { getXmls } from '../core';
import {readFile} from 'fs/promises';

export function DSKExportsHandler(
  mapper: (x?: DSKExport) => Movement[] = defaultDSKMapper
): Promise<Movement[]> {

  const files = [
    'report-2022.xml',
    // 'report-01_2022-04-2023.xml',
    // 'report-11_2021-11_2022.xml',
    // 'report-2020-debit-card-income.csv',
  ].map((v) => {
    const u = new URL(location.toString());
    u.pathname = v;
    return u.toString();
  });

  return Promise.all(
    files.map((f) => f.endsWith('xml') ? getXmls<DSKExport>(f) : csv(f) as Promise<DSKExport>)
  )
    .then((exports) => exports.flatMap(mapper))
    .then(dedupe);
}

export function Simple() {
  // xml('file://../report-2022.xml').then(console.log, console.error)


  return Promise.resolve([{amount: 3, date: new Date()}])
}

export type DSKAccountMovement = {
  ValueDate: string;
  Reason: string;
  OppositeSideName: string;
  OppositeSideAccount: string;
  MovementType: MovementType;
  Amount: string;
};

export type DSKExport =
  | {
      AccountMovements: {
        AccountMovement: DSKAccountMovement[];
      };
    }
  | ({
      'Валутен курс': string;
      'Вид транзакция': string;
      Дата: string;
      'Дебит BGN': string;
      'Кредит BGN': string;
      'Наредител/Получател': string;
      'Номер сметка на наредителя / получателя': string;
      Основание: string;
      'Свързваща референция': string;
      'Сума във валутата на превода': string;
    }[] & { columns: string[] });

export function getDateFromBGString(bgDate: string): Date {
  const [day, month, year] = bgDate.split('.');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date;
}

export function getNumberFromBgString(bgAmount: string) {
  return parseFloat(bgAmount.replace(',', '.'));
}

export function defaultDSKMapper(exports?: DSKExport): Movement[] {
  if (exports == null) {
    return [];
  }
  if (Array.isArray(exports)) {
    const isDebit = (x: Record<string, string>) => x['Дебит BGN'] !== '';

    return exports.map((x) => ({
      date: getDateFromBGString(x.Дата),
      amount: getNumberFromBgString(
        isDebit(x) ? x['Дебит BGN'] : x['Кредит BGN']
      ),
      type: isDebit(x) ? 'Debit' : 'Credit',
      description: x['Основание'],
    }));
  }

  return (exports?.AccountMovements?.AccountMovement ?? []).map((v) => {
    const date = getDateFromBGString(v.ValueDate);

    if (date.toString() === new Date('Invalid date').toString()) {
      throw new Error(`could not parse ${v.ValueDate}`);
    }

    const amount = getNumberFromBgString(v.Amount);

    return {
      date,
      description: `${v.Reason}| ${v.OppositeSideAccount}[ACC:${v.OppositeSideAccount}]`,
      type: v.MovementType,
      amount,
    };
  });
}

const dedupe = (all: Movement[]): Movement[] => {
  // group by date,amount, and type to remove duplications from multiple files i.e. same debit reported from multiple files
  const groups = group(all, (a) => `${a.amount}-${a.date.toString()}-${a.type}`);
  return [...groups.values()].map((v) => v[0]);
};
