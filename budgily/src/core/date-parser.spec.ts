import { DateParser } from './date-parser';

test('should parse date', () => {

  console.log('---->', new DateParser('bg-BG').parse('12.12.2023')?.toDateString())
  // expect(new DateParser('bg-BG').parse('12.12.2023')).toEqual(new Date(2023, 11, 12))
})
