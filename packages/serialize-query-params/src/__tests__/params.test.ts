import { describe, it } from 'vitest';
import {
  StringParam,
  NumberParam,
  ObjectParam,
  ArrayParam,
  NumericArrayParam,
  JsonParam,
  DateParam,
  DateTimeParam,
  BooleanParam,
  NumericObjectParam,
  DelimitedArrayParam,
  DelimitedNumericArrayParam,
  createEnumParam,
  createEnumArrayParam,
  createEnumDelimitedArrayParam,
} from '../index';

describe('params', () => {
  describe('smoke tests', () => {
    it('StringParam', () => {
      expect(StringParam.encode('foo')).toBe('foo');
      expect(StringParam.decode('bar')).toBe('bar');
    });
    it('NumberParam', () => {
      expect(NumberParam.encode(123)).toBe('123');
      expect(NumberParam.decode('345.2')).toBe(345.2);
    });
    it('ObjectParam', () => {
      expect(ObjectParam.encode({ foo: 'bar' })).toBe('foo-bar');
      expect(ObjectParam.decode('foo-bar')).toEqual({ foo: 'bar' });
    });
    it('ArrayParam', () => {
      expect(ArrayParam.encode(['foo', 'bar'])).toEqual(['foo', 'bar']);
      expect(ArrayParam.decode(['foo', 'bar'])).toEqual(['foo', 'bar']);
    });
    it('NumericArrayParam', () => {
      expect(NumericArrayParam.encode([1, 2])).toEqual(['1', '2']);
      expect(NumericArrayParam.decode(['1', '2'])).toEqual([1, 2]);
    });
    it('JsonParam', () => {
      expect(JsonParam.encode({ foo: 'bar' })).toBe('{"foo":"bar"}');
      expect(JsonParam.decode('{"foo":"bar"}')).toEqual({ foo: 'bar' });
    });
    it('DateParam', () => {
      expect(DateParam.encode(new Date(2019, 2, 14))).toBe('2019-03-14');
      const result = DateParam.decode('2019-03-14') as Date;
      expect(result.getFullYear()).toBe(2019);
      expect(result.getMonth()).toBe(2);
      expect(result.getDate()).toBe(14);
    });

    describe('DateTimeParam', function () {
      it.each([
        [
          new Date(Date.UTC(2019, 2, 14, 12, 30, 1, 300)),
          '2019-03-14T12:30:01.300Z',
        ],
        [new Date(Date.UTC(2019, 2, 14)), '2019-03-14T00:00:00.000Z'],
      ])('DateTimeParam encode(%s)', (date, expectedString) => {
        expect(DateTimeParam.encode(date)).toBe(expectedString);
      });
      it.each([
        [
          '2019-03-14T10:30:01.300Z',
          {
            fullYear: 2019,
            month: 2,
            date: 14,
            hours: 10,
            minutes: 30,
            seconds: 1,
            milliseconds: 300,
          },
        ],
        [
          'December 17, 1995 03:24:00Z',
          {
            fullYear: 1995,
            month: 11,
            date: 17,
            hours: 3,
            minutes: 24,
            seconds: 0,
            milliseconds: 0,
          },
        ],
        [
          'Jun 30, 1995 03:24:00.321Z',
          {
            fullYear: 1995,
            month: 5,
            date: 30,
            hours: 3,
            minutes: 24,
            seconds: 0,
            milliseconds: 321,
          },
        ],
      ])('DateTimeParam decode(%s)', (dateString, expectedDate) => {
        const result = DateTimeParam.decode(
          new Date(dateString).toISOString()
        ) as Date;

        expect(result.getUTCFullYear()).toBe(expectedDate.fullYear);
        expect(result.getUTCMonth()).toBe(expectedDate.month);
        expect(result.getUTCDate()).toBe(expectedDate.date);
        expect(result.getUTCHours()).toBe(expectedDate.hours);
        expect(result.getUTCMinutes()).toBe(expectedDate.minutes);
        expect(result.getUTCSeconds()).toBe(expectedDate.seconds);
        expect(result.getUTCMilliseconds()).toBe(expectedDate.milliseconds);
      });
    });

    it('BooleanParam', () => {
      expect(BooleanParam.encode(true)).toBe('1');
      expect(BooleanParam.decode('0')).toBe(false);
    });
    it('NumericObjectParam', () => {
      expect(NumericObjectParam.encode({ foo: 123 })).toBe('foo-123');
      expect(NumericObjectParam.decode('foo-123')).toEqual({ foo: 123 });
    });
    it('DelimitedArrayParam', () => {
      expect(DelimitedArrayParam.encode(['foo', 'bar'])).toBe('foo_bar');
      expect(DelimitedArrayParam.decode('foo_bar')).toEqual(['foo', 'bar']);
    });
    it('DelimitedNumericArrayParam', () => {
      expect(DelimitedNumericArrayParam.encode([1, 2])).toBe('1_2');
      expect(DelimitedNumericArrayParam.decode('1_2')).toEqual([1, 2]);
    });
    it('createEnumParam', () => {
      const TestEnumParam = createEnumParam(['foo', 'bar']);
      expect(TestEnumParam.encode('foo')).toBe('foo');
      expect(TestEnumParam.decode('bar')).toBe('bar');
      expect(TestEnumParam.decode('baz')).toBeUndefined();
    });
    it('createEnumArrayParam', () => {
      const TestArrayEnumParam = createEnumArrayParam(['red', 'green', 'blue']);

      expect(TestArrayEnumParam.encode(['red'])).toEqual(['red']);
      expect(TestArrayEnumParam.encode(['red', 'green', 'blue'])).toEqual([
        'red',
        'green',
        'blue',
      ]);

      expect(TestArrayEnumParam.decode(['red', 'purple'])).toBeUndefined();
      expect(TestArrayEnumParam.decode('purple')).toBeUndefined();
    });
    it('createEnumDelimitedArrayParam', () => {
      const TestArrayEnumParam = createEnumDelimitedArrayParam([
        'red',
        'green',
        'blue',
      ]);

      expect(TestArrayEnumParam.encode(['red'])).toBe('red');
      expect(TestArrayEnumParam.encode(['red', 'green', 'blue'])).toBe(
        'red_green_blue'
      );
      expect(TestArrayEnumParam.decode('red_green_blue')).toEqual([
        'red',
        'green',
        'blue',
      ]);
      expect(TestArrayEnumParam.decode('red_purple')).toBeUndefined();
      expect(TestArrayEnumParam.decode('purple')).toBeUndefined();
    });
  });
});
