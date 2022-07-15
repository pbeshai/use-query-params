import { describe, it } from 'vitest';
import {
  encodeDate,
  decodeDate,
  encodeBoolean,
  decodeBoolean,
  encodeNumber,
  decodeNumber,
  encodeString,
  decodeString,
  decodeEnum,
  decodeArrayEnum,
  decodeDelimitedArrayEnum,
  encodeJson,
  decodeJson,
  encodeArray,
  decodeArray,
  encodeNumericArray,
  decodeNumericArray,
  encodeObject,
  decodeObject,
  encodeNumericObject,
  decodeNumericObject,
  encodeDelimitedNumericArray,
  decodeDelimitedNumericArray,
  encodeDelimitedArray,
  decodeDelimitedArray,
} from '../index';

describe('serialize', () => {
  describe('encodeDate', () => {
    it('produces the correct value', () => {
      const date = new Date(2016, 2, 1);
      const result = encodeDate(date);
      expect(result).toBe('2016-03-01');
    });

    it('handles null and undefined', () => {
      expect(encodeDate(null)).toBeNull();
      expect(encodeDate(undefined)).toBeUndefined();
    });
  });

  describe('decodeDate', () => {
    it('produces the correct value', () => {
      let result = decodeDate('2016-03-01') as Date;
      // result is a Date object
      expect(result.getFullYear()).toBe(2016);
      expect(result.getMonth()).toBe(2);
      expect(result.getDate()).toBe(1);

      // javascript likes to give us 2015-12-31 19:00, so test this doesn't.
      result = decodeDate('2016') as Date;
      expect(result.getFullYear()).toBe(2016);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(1);
    });

    it('handles null and undefined', () => {
      expect(decodeDate(null)).toBeNull();
      expect(decodeDate('')).toBeNull();
      expect(decodeDate(undefined)).toBeUndefined();
    });

    it('handles malformed input', () => {
      const result = decodeDate('foo-one-two');
      expect(result).toBe(null);
    });

    it('handles array of values', () => {
      const result = decodeDate(['2019-03-01', '2019-05-01']);
      expect(result!.getFullYear()).toBe(2019);
      expect(result!.getMonth()).toBe(2);
      expect(result!.getDate()).toBe(1);
    });
  });

  describe('encodeBoolean', () => {
    it('produces the correct value', () => {
      expect(encodeBoolean(true)).toBe('1');
      expect(encodeBoolean(false)).toBe('0');
      expect(encodeBoolean(undefined)).toBeUndefined();
      expect(encodeBoolean(null)).toBeNull();
    });
  });

  describe('decodeBoolean', () => {
    it('produces the correct value', () => {
      expect(decodeBoolean('1')).toBe(true);
      expect(decodeBoolean('0')).toBe(false);
      expect(decodeBoolean(undefined)).toBeUndefined();
      expect(decodeBoolean('')).toBeNull();
      expect(decodeBoolean(null)).toBeNull();
    });

    it('handles malformed input', () => {
      expect(decodeBoolean('foo')).toBeNull();
    });

    it('handles array of values', () => {
      expect(decodeBoolean(['1', '0'])).toBe(true);
    });
  });

  describe('encodeNumber', () => {
    it('produces the correct value', () => {
      expect(encodeNumber(123)).toBe('123');
      expect(encodeNumber(-32.12)).toBe('-32.12');
      expect(encodeNumber(undefined)).toBeUndefined();
      expect(encodeNumber(null)).toBeNull();
    });
  });

  describe('decodeNumber', () => {
    it('produces the correct value', () => {
      expect(decodeNumber('99')).toBe(99);
      expect(decodeNumber('-58.21')).toBe(-58.21);
      expect(decodeNumber(undefined)).toBeUndefined();
      expect(decodeNumber('')).toBeNull();
      expect(decodeNumber(null)).toBeNull();
    });

    it('handles malformed input', () => {
      expect(decodeNumber('foo')).toBeNaN();
    });

    it('handles array of values', () => {
      expect(decodeNumber(['1', '0'])).toBe(1);
    });
  });

  describe('encodeString', () => {
    it('produces the correct value', () => {
      expect(encodeString('foo')).toBe('foo');
      expect(encodeString('')).toBe('');
      expect(encodeString(null)).toBeNull();
      expect(encodeString(undefined)).toBeUndefined();
    });
  });

  describe('decodeString', () => {
    it('produces the correct value', () => {
      expect(decodeString('bar')).toBe('bar');
      expect(decodeString('')).toBe('');
      expect(decodeString(undefined)).toBeUndefined();
      expect(decodeString(null)).toBeNull();
    });

    it('handles array of values', () => {
      expect(decodeString(['foo', 'bar'])).toBe('foo');
    });
  });

  describe('decodeEnum', () => {
    const enumValues = ['foo', 'bar'];

    it('produces the correct value', () => {
      expect(decodeEnum('foo', enumValues)).toBe('foo');
      expect(decodeEnum('bar', enumValues)).toBe('bar');
      expect(decodeEnum('baz', enumValues)).toBeUndefined();
      expect(decodeEnum('', enumValues)).toBeUndefined();
      expect(decodeEnum(undefined, enumValues)).toBeUndefined();
      expect(decodeEnum(null, enumValues)).toBeNull();
    });

    it('handles array of values', () => {
      expect(decodeEnum(['foo', 'bar'], enumValues)).toBe('foo');
    });
  });

  describe('decodeArrayEnum', () => {
    type Color = 'red' | 'green' | 'blue';
    const enumValues: Color[] = ['red', 'green', 'blue'];

    it('produces the correct value', () => {
      expect(decodeArrayEnum('red', enumValues)).toEqual(['red']);
      expect(decodeArrayEnum(['red', 'green', 'blue'], enumValues)).toEqual([
        'red',
        'green',
        'blue',
      ]);
      expect(decodeArrayEnum(['red', 'green'], enumValues)).toEqual([
        'red',
        'green',
      ]);
      expect(decodeArrayEnum(['red', 'purple'], enumValues)).toBeUndefined();
      expect(decodeArrayEnum(['pink', 'purple'], enumValues)).toBeUndefined();
      expect(decodeArrayEnum([], enumValues)).toBeUndefined();
      expect(decodeArrayEnum('', enumValues)).toBeUndefined();
      expect(decodeArrayEnum(undefined, enumValues)).toBeUndefined();
      expect(decodeArrayEnum(null, enumValues)).toBeNull();
    });
  });

  describe('decodeDelimitedArrayEnum', () => {
    type Color = 'red' | 'green' | 'blue';
    const enumValues: Color[] = ['red', 'green', 'blue'];

    it('produces the correct value', () => {
      expect(decodeDelimitedArrayEnum('red', enumValues)).toEqual(['red']);
      expect(decodeDelimitedArrayEnum('red_green_blue', enumValues)).toEqual([
        'red',
        'green',
        'blue',
      ]);
      expect(decodeDelimitedArrayEnum('red,green', enumValues, ',')).toEqual([
        'red',
        'green',
      ]);
      expect(
        decodeDelimitedArrayEnum('red_purple', enumValues)
      ).toBeUndefined();
      expect(
        decodeDelimitedArrayEnum('pink_purple', enumValues)
      ).toBeUndefined();
      expect(decodeDelimitedArrayEnum('', enumValues)).toBeUndefined();
      expect(decodeDelimitedArrayEnum(undefined, enumValues)).toBeUndefined();
      expect(decodeDelimitedArrayEnum(null, enumValues)).toBeNull();
    });

    it('handles array of values', () => {
      expect(decodeDelimitedArrayEnum(['red', 'green'], enumValues)).toEqual([
        'red',
      ]);
      expect(decodeDelimitedArrayEnum(['purple'], enumValues)).toBeUndefined();
      expect(decodeDelimitedArrayEnum([], enumValues)).toBeUndefined();
    });
  });

  describe('encodeJson', () => {
    it('produces the correct value', () => {
      const input = { test: '123', foo: [1, 2, 3] };
      expect(encodeJson(input)).toBe(JSON.stringify(input));
      expect(encodeJson(undefined)).toBeUndefined();
      expect(encodeJson(null)).toBeNull();
      expect(encodeJson(0)).toBe('0');
      expect(encodeJson(false)).toBe('false');
    });
  });

  describe('decodeJson', () => {
    it('produces the correct value', () => {
      const output = decodeJson('{"foo": "bar", "jim": ["grill"]}');
      const expectedOutput = {
        foo: 'bar',
        jim: ['grill'],
      };
      expect(output).toEqual(expectedOutput);
      expect(decodeJson(undefined)).toBeUndefined();
      expect(decodeJson(null)).toBeNull();
      expect(decodeJson('')).toBeNull();
    });

    it('handles malformed input', () => {
      expect(decodeJson('foo')).toBeNull();
    });

    it('handles array of values', () => {
      expect(decodeJson(['"foo"', '"bar"'])).toBe('foo');
    });
  });

  describe('encodeArray', () => {
    it('produces the correct value', () => {
      const input = ['a', 'b', 'c'];
      expect(encodeArray(input)).toEqual(['a', 'b', 'c']);
      expect(encodeArray(undefined)).toBeUndefined();
      expect(encodeArray(null)).toBeNull();
      expect(encodeArray([])).toEqual([]);
      expect(encodeArray(['a', null, '', 'b'])).toEqual(['a', null, '', 'b']);
    });
  });

  describe('decodeArray', () => {
    it('produces the correct value', () => {
      const output = decodeArray(['a', 'b', 'c']);
      const expectedOutput = ['a', 'b', 'c'];

      expect(output).toEqual(expectedOutput);
      expect(decodeArray(undefined)).toBeUndefined();
      expect(decodeArray('')).toEqual([]);
      expect(decodeArray([])).toEqual([]);
      expect(decodeArray(null)).toBeNull();
    });

    it('handles empty values', () => {
      expect(decodeArray(['a', '', null, 'b'])).toEqual(['a', '', null, 'b']);
    });
  });

  describe('encodeNumericArray', () => {
    it('produces the correct value', () => {
      const input = [1, 2, 3];
      expect(encodeNumericArray(input)).toEqual(['1', '2', '3']);
      expect(encodeNumericArray(undefined)).toBeUndefined();
      expect(encodeNumericArray(null)).toBeNull();
      expect(encodeNumericArray([])).toEqual([]);
    });
  });

  describe('decodeNumericArray', () => {
    it('produces the correct value', () => {
      const output = decodeNumericArray(['1', '2', '3']);
      const expectedOutput = [1, 2, 3];

      expect(output).toEqual(expectedOutput);
      expect(decodeNumericArray(undefined)).toBeUndefined();
      expect(decodeNumericArray(null)).toBeNull();
      expect(decodeNumericArray('')).toEqual([]);
      expect(decodeNumericArray([])).toEqual([]);
    });

    it('handles empty and NaN values', () => {
      expect(decodeNumericArray(['1', '', '2', 'foo', '3'])).toEqual([
        1,
        null,
        2,
        NaN,
        3,
      ]);
    });
  });

  describe('encodeDelimitedArray', () => {
    it('produces the correct value', () => {
      const input = ['a', 'b', 'c'];
      expect(encodeDelimitedArray(input)).toBe('a_b_c');
      expect(encodeDelimitedArray(undefined)).toBeUndefined();
      expect(encodeDelimitedArray(null)).toBeNull();
      expect(encodeDelimitedArray([])).toBe('');
    });
  });

  describe('decodeDelimitedArray', () => {
    it('produces the correct value', () => {
      const output = decodeDelimitedArray('a_b_c');
      const expectedOutput = ['a', 'b', 'c'];

      expect(output).toEqual(expectedOutput);
      expect(decodeDelimitedArray(undefined)).toBeUndefined();
      expect(decodeDelimitedArray('')).toEqual([]);
      expect(decodeDelimitedArray(null)).toBe(null);
    });

    it('handles empty values', () => {
      expect(decodeDelimitedArray('__')).toEqual(['', '', '']);
    });

    it('handles array of values', () => {
      expect(decodeDelimitedArray(['foo_bar', 'jim_grill'])).toEqual([
        'foo',
        'bar',
      ]);
    });
  });

  describe('encodeDelimitedNumericArray', () => {
    it('produces the correct value', () => {
      const input = [9, 4, 0];
      expect(encodeDelimitedNumericArray(input)).toBe('9_4_0');
      expect(encodeDelimitedNumericArray(undefined)).toBeUndefined();
      expect(encodeDelimitedNumericArray(null)).toBe(null);
      expect(encodeDelimitedNumericArray([])).toBe('');
    });
  });

  describe('decodeDelimitedNumericArray', () => {
    it('produces the correct value', () => {
      const output = decodeDelimitedNumericArray('9_4_0');
      const expectedOutput = [9, 4, 0];

      expect(output).toEqual(expectedOutput);
      expect(decodeDelimitedNumericArray(undefined)).toBeUndefined();
      expect(decodeDelimitedNumericArray('')).toEqual([]);
      expect(decodeDelimitedNumericArray(null)).toBeNull();
    });

    it('filters empty values', () => {
      expect(decodeDelimitedNumericArray('__')).toEqual([null, null, null]);
    });

    it('handles array of values', () => {
      expect(decodeDelimitedNumericArray(['1_2', '3_4'])).toEqual([1, 2]);
    });
  });

  describe('encodeObject', () => {
    it('produces the correct value', () => {
      const input = { test: 'bar', foo: '94', bar: '', baz: '-baz-' };
      const expectedOutput = 'test-bar_foo-94_bar-_baz--baz-';
      expect(encodeObject(input, '-', '_')).toBe(expectedOutput);
      expect(encodeObject(undefined)).toBeUndefined();
      expect(encodeObject(null)).toBeNull();
      expect(encodeObject({})).toBe('');
    });
  });

  describe('decodeObject', () => {
    it('produces the correct value', () => {
      const output = decodeObject('foo-bar_jim-grill_kly-91_baz-_t--x-');
      const expectedOutput = {
        foo: 'bar',
        jim: 'grill',
        kly: '91',
        baz: '',
        t: '-x-',
      };
      expect(output).toEqual(expectedOutput);
      expect(decodeObject(undefined)).toBeUndefined();
      expect(decodeObject('')).toEqual({});
      expect(decodeObject(null)).toBeNull();
    });

    it('handles malformed input', () => {
      expect(decodeObject('foo-bar-jim-grill')).toEqual({
        foo: 'bar-jim-grill',
      });
      expect(decodeObject('foo_bar_jim_grill')).toEqual({
        foo: undefined,
        bar: undefined,
        jim: undefined,
        grill: undefined,
      });
    });

    it('handles array of values', () => {
      expect(decodeObject(['foo-bar', 'jim-grill'])).toEqual({ foo: 'bar' });
    });
  });

  describe('encodeNumericObject', () => {
    it('produces the correct value', () => {
      const input = { test: 55, foo: 94 };
      const expectedOutput = 'test-55_foo-94';
      expect(encodeNumericObject(input, '-', '_')).toBe(expectedOutput);
      expect(encodeNumericObject(undefined)).toBeUndefined();
      expect(encodeNumericObject(null)).toBeNull();
      expect(encodeNumericObject({})).toBe('');
    });
  });

  describe('decodeNumericObject', () => {
    it('produces the correct value', () => {
      const output = decodeNumericObject('foo-55_jim-100_kly-94');
      const expectedOutput = {
        foo: 55,
        jim: 100,
        kly: 94,
      };
      expect(output).toEqual(expectedOutput);
      expect(decodeNumericObject(undefined)).toBeUndefined();
      expect(decodeNumericObject(null)).toBeNull();
      expect(decodeNumericObject('')).toEqual({});
    });

    it('produces the correct value for negative numbers', () => {
      const output = decodeNumericObject('foo--55_jim--100_kly--94');
      const expectedOutput = {
        foo: -55,
        jim: -100,
        kly: -94,
      };
      expect(output).toEqual(expectedOutput);
    });

    it('handles malformed input', () => {
      expect(decodeNumericObject('foo-bar-jim-grill')).toEqual({
        foo: NaN,
      });
      expect(decodeNumericObject('foo_bar_jim_grill')).toEqual({
        foo: undefined,
        bar: undefined,
        jim: undefined,
        grill: undefined,
      });
    });

    it('handles array of values', () => {
      expect(decodeNumericObject(['foo-55', 'jim-100'])).toEqual({
        foo: 55,
      });
    });
  });
});
