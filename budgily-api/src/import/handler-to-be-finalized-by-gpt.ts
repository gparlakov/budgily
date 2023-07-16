import { createHash } from 'node:crypto';
import { XMLParser } from 'fast-xml-parser';
import { csvParse } from 'd3';

type MovementType = 'credit' | 'debit';

interface Movement {
  id: string;
  date: Date;
  amount: number;
  type: MovementType;
  sender?: string;
  receiver?: string;
  description: string;
  raw: string;
}

function readObjectProperty(x: any, propName: string) {
  if(x == null || typeof propName != 'string'){
    return undefined;
  }

  if(propName.includes('.')) {
    const [prop, ...rest] = propName.split('.')
    return readObjectProperty(x[prop], rest.join('.'))
  } else {
    return x[propName]
  }
}

export function defaultDSKMapper(rawText: string): Movement[] {
  if (typeof rawText != 'string') {
    return [];
  }

  const addHash = (x: Movement) => {
    return {
      ...x,
      id: createHash('sha256').update(`${x.date}-${x.amount}-${x.type}-${x.description}`).digest('base64'),
    };
  };

  const parserOptions = {};
  const parser = new XMLParser({
    unpairedTags: ['br', 'hr'],
    stopNodes: ['*.br'],
    textNodeName: '$_text',
    ...parserOptions
  });

  const propName = ''
  const parsed = parser.parse(rawText);
  const movementsArray = readObjectProperty(parsed, propName);



    return exports
      .map((x) => ({
        id: '',
        date: getDateFromBGString(x.Дата).valueOf().toString(),
        amount: getNumberFromBgString(isDebit(x) ? x['Дебит BGN'] : x['Кредит BGN']),
        type: isDebit(x) ? MovementType.Debit : MovementType.Credit,
        description: readParsedValue(x['Основание']),
        account: x['Номер сметка на наредителя / получателя'],
        raw: JSON.stringify(x),
        opposite: readParsedValue(x['Наредител/Получател']),
      }))
      .map(addHash);
}


export function parseMovement(rawText: string): Movement[] {
  if (exports == null) {
    return [];
  }

  const addHash = (x: Movement) => {
    return {
      ...x,
      id: createHash('sha256').update(`${x.date}-${x.amount}-${x.type}-${x.description}`).digest('base64'),
    };
  };

  if (Array.isArray(exports)) {
    const isDebit = (x: Record<'Дебит BGN' | 'Кредит BGN', string>) => x['Дебит BGN'] !== '';

    return exports
      .map((x) => ({
        id: '',
        date: getDateFromBGString(x.Дата).valueOf().toString(),
        amount: getNumberFromBgString(isDebit(x) ? x['Дебит BGN'] : x['Кредит BGN']),
        type: isDebit(x) ? MovementType.Debit : MovementType.Credit,
        description: readParsedValue(x['Основание']),
        account: x['Номер сметка на наредителя / получателя'],
        raw: JSON.stringify(x),
        opposite: readParsedValue(x['Наредител/Получател']),
      }))
      .map(addHash);
  }

  return (exports?.AccountMovements?.AccountMovement ?? [])
    .map((v) => {
      const date = getDateFromBGString(v.ValueDate);

      if (date.toString() === new Date('Invalid date').toString()) {
        throw new Error(`could not parse ${v.ValueDate}`);
      }

      const amount = getNumberFromBgString(v.Amount);

      return {
        id: '',
        date: date.valueOf().toString(),
        description: readParsedValue(v.Reason),
        account: v.OppositeSideAccount,
        type: v.MovementType === 'Debit' ? MovementType.Debit : MovementType.Credit,
        amount,
        raw: JSON.stringify(v),
        opposite: readParsedValue(v.OppositeSideName),
      };
    })
    .map(addHash);
}
