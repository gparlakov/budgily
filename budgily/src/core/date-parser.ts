import { invalid } from './invalid-locales';

export const skipped = [
  ...invalid,
  'ar-sa',
  'tzm-latn-',
  'ccp-cakm-',
  'zh-sg',
  'prs-af',
  'kkj-cm',
  'mzn-ir',
  'jgo-cm',
  'lrc-ir',
  'ps-af',
  'fa-af',
  'fa-ir',
  'xog-ug',
  'uz-arab',
  'th-th',
  'uz-arab-af'
];

// next iteration might take the individual separators between month day and year in the order they were
// provided by the localized format parts (and skip the rest - so type === year, day, month, literal and then take the values until we have all the above - skip the rest)
export class DateParser {
  private _yearPosition: number;
  private _monthPosition: number;
  private _dayPosition: number;
  private _dateRexExp: RegExp;
  private _index: Map<string, string>;

  constructor(locale: string) {
    const format = new Intl.DateTimeFormat(locale);

    const parts = format.formatToParts(new Date(2023, 6, 7));

    // in bg-BG for example it will be '7.7.2023 г.' so we'll have the '.' x2 and the ' г.' x1
    // so we'll take the literal that's repeated multiple times and consider that the separator
    const literals = parts
      .filter((f) => f.type === 'literal')
      .reduce((acc, lit) => {
        acc[lit.value] = typeof acc[lit.value] === 'number' ? (acc[lit.value] += 1) : 1;
        return acc;
      }, {} as Record<string, number>);

    const [separator] = Object.entries(literals).sort(([, aCount], [, bCount]) => bCount - aCount)[0];

    this._yearPosition = parts.filter((p) => p.type != 'literal').findIndex((p) => p.type === 'year') + 1;
    this._monthPosition = parts.filter((p) => p.type != 'literal').findIndex((p) => p.type === 'month') + 1;
    this._dayPosition = parts.filter((p) => p.type != 'literal').findIndex((p) => p.type === 'day') + 1;

    const tokenized = parts
      .filter((p) => p.type === 'year' || p.type === 'month' || p.type === 'day')
      .map((p) =>
        p.type === 'year'
          ? new Array(p.value.length).fill('Y').join('')
          : p.type === 'month'
          ? new Array(p.value.length).fill('M').join('')
          : new Array(p.value.length).fill('D').join('')
      )
      // escape separator if special regex symbol
      .join('.+*?^$[]{}()|/\\'.includes(separator) ? `\\${separator}` : separator);
    this._dateRexExp = new RegExp(tokenized.replace(/Y+/, '(\\d+)').replace(/D+/, '(\\d+)').replace(/M+/, '(\\d+)'));

    const numberFormatter = new Intl.NumberFormat(locale);
    const numerals = Array.from({ length: 10 }).map((_, i) => numberFormatter.format(i));
    this._index = new Map(numerals.map((d, i) => [d, i.toString()]));

  }

  parse(string: string) {
    const digits = [...this._index.entries()].reduce(
      (s, [localeDigit, digit]) => s.replace(new RegExp(localeDigit, 'g'), digit),
      string
    );

    const parts = this._dateRexExp.exec(digits);
    if (parts == null || parts.length < 4) {
      return undefined;
    }

    const res =  new Date(
      parseInt(parts[this._yearPosition]),
      parseInt(parts[this._monthPosition]) - 1,
      parseInt(parts[this._dayPosition])
    );
    return res;
  }
}
