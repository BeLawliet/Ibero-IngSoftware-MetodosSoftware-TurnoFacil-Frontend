import {
  addLocalDays,
  isValidLocalIsoDate,
  isValidTime,
  parseLocalIsoDate,
  startOfWeekMonday,
  toLocalIsoDate,
} from './date.utils';

describe('local date utilities', () => {
  it('should start the week on Monday without UTC conversion', () => {
    const monday = startOfWeekMonday(new Date(2026, 6, 18));

    expect(monday.getDay()).toBe(1);
    expect(toLocalIsoDate(monday)).toBe('2026-07-13');
  });

  it('should add local calendar days and parse ISO dates locally', () => {
    const date = addLocalDays(new Date(2026, 6, 31), 1);

    expect(toLocalIsoDate(date)).toBe('2026-08-01');
    expect(parseLocalIsoDate('2026-08-01').getDate()).toBe(1);
  });

  it('should validate date and time parameters safely', () => {
    expect(isValidLocalIsoDate('2026-02-28')).toBe(true);
    expect(isValidLocalIsoDate('2026-02-30')).toBe(false);
    expect(isValidLocalIsoDate('fecha')).toBe(false);
    expect(isValidTime('07:30')).toBe(true);
    expect(isValidTime('24:00')).toBe(false);
    expect(isValidTime('9:30')).toBe(false);
  });
});
