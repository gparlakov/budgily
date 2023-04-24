import { Movement, MovementType } from '../../generated/graphql';
import { ClientContext } from '../core/types';
import { group } from 'd3';

export type MovementTypeDSK = 'Debit' | 'Credit';

export type DSKAccountMovement = {
  ValueDate: string;
  Reason: string;
  OppositeSideName: string;
  OppositeSideAccount: string;
  MovementType: MovementTypeDSK;
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
      date: getDateFromBGString(x.Дата).valueOf().toString(),
      amount: getNumberFromBgString(isDebit(x) ? x['Дебит BGN'] : x['Кредит BGN']),
      type: isDebit(x) ? MovementType.Debit : MovementType.Credit,
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
      date: date.valueOf().toString(),
      description: `${v.Reason}| ${v.OppositeSideAccount}[ACC:${v.OppositeSideAccount}]`,
      type: v.MovementType === 'Debit' ? MovementType.Debit : MovementType.Credit,
      amount,
    };
  });
}

export const dedupe = (all: Movement[]): Movement[] => {
  // group by date,amount, and type to remove duplications from multiple files i.e. same debit reported from multiple files
  const groups = group(all, (a) => `${a.amount}-${a.date?.toString()}-${a.type}`);
  return [...groups.values()].map((v) => v[0]);
};
