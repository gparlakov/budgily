import { DateParser, skipped } from './date-parser';

import locales from './../components/select-locale/locales.json?inline';

test('should parse BG date', () => {
  expect(new DateParser('bg-BG').parse('12.12.2023')).toEqual(new Date(2023, 11, 12));
});

test('should parse dates from all locales (except for the skipped ones)', () => {
  Object.keys(locales)
    .filter((l) => !skipped.includes(l))
    .forEach((locale) => {
      // last month
      const dec12 = new Date(2023, 11, 12);
      const dec31 = new Date(2023, 11, 31);
      const jan1 = new Date(2023, 0, 1);
      const jan31 = new Date(2023, 0, 31);
      const mar3 = new Date(2023, 2, 3);
      const june6 = new Date(2023, 5, 6);
      const localizer = new Intl.DateTimeFormat(locale);
      const parser = new DateParser(locale);

      expect(parser.parse(localizer.format(dec12))).toEqual(dec12);
      expect(parser.parse(localizer.format(dec31))).toEqual(dec31);
      expect(parser.parse(localizer.format(jan1))).toEqual(jan1);
      expect(parser.parse(localizer.format(jan31))).toEqual(jan31);
      expect(parser.parse(localizer.format(mar3))).toEqual(mar3);
      expect(parser.parse(localizer.format(june6))).toEqual(june6);
    });
});
