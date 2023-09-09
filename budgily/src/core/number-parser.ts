export class NumberParser {
  private _group: RegExp;
  private _decimal: RegExp;
  private _numeral: RegExp;
  private _index: (d: string) => string;

  constructor(locale: string) {
    const format = new Intl.NumberFormat(locale);
    const parts = format.formatToParts(12345.6);
    const numerals = Array.from({ length: 10 }).map((_, i) => format.format(i));
    const index = new Map(numerals.map((d, i) => [d, i]));
    this._group = new RegExp(`[${parts.find((d) => d.type === 'group')?.value ?? ''}]`, 'g');
    this._decimal = new RegExp(`[${parts.find((d) => d.type === 'decimal')?.value ?? ''}]`);
    this._numeral = new RegExp(`[${numerals.join('')}]`, 'g');
    this._index = (d) => index.get(d)?.toString() ?? '';
  }

  parse(string: string) {
    const str = string.trim().replace(this._group, '').replace(this._decimal, '.').replace(this._numeral, this._index);
    return str ? +str : NaN;
  }
}
