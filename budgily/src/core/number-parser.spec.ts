// @ts-ignore - these are the locales
import locales from './../components/select-locale/locales.json?inline';
import { invalid } from './invalid-locales';
import { NumberParser } from "./number-parser";
const skipped = ['ccp-cakm', 'ee-gh', 'ee-tg']
test('should parse dates from all locales (except for the skipped ones)', () => {
  Object.keys(locales)
    .filter((l) => !invalid.includes(l) && !skipped.includes(l))
    .forEach((locale) => {
      // last month
      const _9876543210 = 9876543210;
      const _9876543210point9876543210 = 9876543210.988;
      const localizer = new Intl.NumberFormat(locale);
      const parser = new NumberParser(locale);

      expect(parser.parse(localizer.format(_9876543210))).toEqual(_9876543210);
      expect(parser.parse(localizer.format(_9876543210point9876543210))).toEqual(_9876543210point9876543210);
    });
});
