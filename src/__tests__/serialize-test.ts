import {
  encodeDate,
  decodeDate,
  encodeBoolean,
  decodeBoolean,
  encodeNumber,
  decodeNumber,
  encodeString,
  decodeString,
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
      const result = encodeDate(null);
      expect(result).toBeUndefined();
      expect(encodeDate(undefined)).not.toBeDefined();
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
      const result = decodeDate(null);
      expect(result).not.toBeDefined();
      expect(decodeDate(undefined)).not.toBeDefined();
      expect(decodeDate('')).not.toBeDefined();
    });

    it('handles malformed input', () => {
      const result = decodeDate('foo-one-two');
      expect(result).not.toBeDefined();
    });

    it('handles array of values', () => {
      const result = decodeDate(['2019-03-01', '2019-05-01']);
      expect(result.getFullYear()).toBe(2019);
      expect(result.getMonth()).toBe(2);
      expect(result.getDate()).toBe(1);
    });
  });

  describe('encodeBoolean', () => {
    it('produces the correct value', () => {
      expect(encodeBoolean(true)).toBe('1');
      expect(encodeBoolean(false)).toBe('0');
      expect(encodeBoolean(undefined)).not.toBeDefined();
    });
  });

  describe('decodeBoolean', () => {
    it('produces the correct value', () => {
      expect(decodeBoolean('1')).toBe(true);
      expect(decodeBoolean('0')).toBe(false);
      expect(decodeBoolean(undefined)).not.toBeDefined();
      expect(decodeBoolean('')).not.toBeDefined();
    });

    it('handles malformed input', () => {
      expect(decodeBoolean('foo')).not.toBeDefined();
    });

    it('handles array of values', () => {
      expect(decodeBoolean(['1', '0'])).toBe(true);
    });
  });

  describe('encodeNumber', () => {
    it('produces the correct value', () => {
      expect(encodeNumber(123)).toBe('123');
      expect(encodeNumber(-32.12)).toBe('-32.12');
      expect(encodeNumber(undefined)).not.toBeDefined();
    });
  });

  describe('decodeNumber', () => {
    it('produces the correct value', () => {
      expect(decodeNumber('99')).toBe(99);
      expect(decodeNumber('-58.21')).toBe(-58.21);
      expect(decodeNumber(undefined)).not.toBeDefined();
      expect(decodeNumber('')).not.toBeDefined();
    });

    it('handles malformed input', () => {
      expect(decodeNumber('foo')).not.toBeDefined();
    });

    it('handles array of values', () => {
      expect(decodeNumber(['1', '0'])).toBe(1);
    });
  });

  describe('encodeString', () => {
    it('produces the correct value', () => {
      expect(encodeString('foo')).toBe('foo');
      expect(encodeString(undefined)).not.toBeDefined();
    });
  });

  describe('decodeString', () => {
    it('produces the correct value', () => {
      expect(decodeString('bar')).toBe('bar');
      expect(decodeString('')).toBe('');
      expect(decodeString(undefined)).not.toBeDefined();
      expect(decodeString(null)).not.toBeDefined();
    });

    it('handles array of values', () => {
      expect(decodeString(['foo', 'bar'])).toBe('foo');
    });
  });

  describe('encodeJson', () => {
    it('produces the correct value', () => {
      const input = { test: '123', foo: [1, 2, 3] };
      expect(encodeJson(input)).toBe(JSON.stringify(input));
      expect(encodeJson(undefined)).not.toBeDefined();
      expect(encodeJson(null)).not.toBeDefined();
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
      expect(decodeJson(undefined)).not.toBeDefined();
      expect(decodeJson('')).not.toBeDefined();
    });

    it('handles malformed input', () => {
      expect(decodeJson('foo')).not.toBeDefined();
    });

    it('handles array of values', () => {
      expect(decodeJson(['"foo"', '"bar"'])).toBe('foo');
    });
  });

  describe('encodeArray', () => {
    it('produces the correct value', () => {
      const input = ['a', 'b', 'c'];
      expect(encodeArray(input)).toEqual(['a', 'b', 'c']);
      expect(encodeArray(undefined)).not.toBeDefined();
    });
  });

  describe('decodeArray', () => {
    it('produces the correct value', () => {
      const output = decodeArray(['a', 'b', 'c']);
      const expectedOutput = ['a', 'b', 'c'];

      expect(output).toEqual(expectedOutput);
      expect(decodeArray(undefined)).not.toBeDefined();
      expect(decodeArray('')).not.toBeDefined();
    });

    it('filters empty values', () => {
      expect(decodeArray(['a', '', 'b'])).toEqual(['a', 'b']);
    });
  });

  describe('encodeNumericArray', () => {
    it('produces the correct value', () => {
      const input = [1, 2, 3];
      expect(encodeNumericArray(input)).toEqual(['1', '2', '3']);
      expect(encodeNumericArray(undefined)).not.toBeDefined();
    });
  });

  describe('decodeNumericArray', () => {
    it('produces the correct value', () => {
      const output = decodeNumericArray(['1', '2', '3']);
      const expectedOutput = [1, 2, 3];

      expect(output).toEqual(expectedOutput);
      expect(decodeNumericArray(undefined)).not.toBeDefined();
      expect(decodeNumericArray('')).not.toBeDefined();
    });

    it('filters empty and NaN values', () => {
      expect(decodeNumericArray(['1', '', '2', 'foo', '3'])).toEqual([1, 2, 3]);
    });
  });

  describe('encodeObject', () => {
    it('produces the correct value', () => {
      const input = { test: 'bar', foo: '94' };
      const expectedOutput = 'test-bar_foo-94';
      expect(encodeObject(input, '-', '_')).toBe(expectedOutput);
      expect(encodeObject(undefined)).not.toBeDefined();
      expect(encodeObject({})).not.toBeDefined();
    });
  });

  describe('decodeObject', () => {
    it('produces the correct value', () => {
      const output = decodeObject('foo-bar_jim-grill_iros-91');
      const expectedOutput = {
        foo: 'bar',
        jim: 'grill',
        iros: '91',
      };
      expect(output).toEqual(expectedOutput);
      expect(decodeObject(undefined)).not.toBeDefined();
      expect(decodeObject('')).not.toBeDefined();
    });

    it('handles malformed input', () => {
      expect(decodeObject('foo-bar-jim-grill')).toEqual({ foo: 'bar' });
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

  describe('encodeDelimitedArray', () => {
    it('produces the correct value', () => {
      const input = ['a', 'b', 'c'];
      expect(encodeDelimitedArray(input)).toBe('a_b_c');
      expect(encodeDelimitedArray(undefined)).not.toBeDefined();
    });
  });

  describe('decodeDelimitedArray', () => {
    it('produces the correct value', () => {
      const output = decodeDelimitedArray('a_b_c');
      const expectedOutput = ['a', 'b', 'c'];

      expect(output).toEqual(expectedOutput);
      expect(decodeDelimitedArray(undefined)).not.toBeDefined();
      expect(decodeDelimitedArray('')).not.toBeDefined();
    });

    it('filters empty values', () => {
      expect(decodeDelimitedArray('__')).toEqual([]);
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
      expect(encodeDelimitedNumericArray(undefined)).not.toBeDefined();
    });
  });

  describe('decodeDelimitedNumericArray', () => {
    it('produces the correct value', () => {
      const output = decodeDelimitedNumericArray('9_4_0');
      const expectedOutput = [9, 4, 0];

      expect(output).toEqual(expectedOutput);
      expect(decodeDelimitedNumericArray(undefined)).not.toBeDefined();
      expect(decodeDelimitedNumericArray('')).not.toBeDefined();
    });

    it('filters empty values', () => {
      expect(decodeDelimitedNumericArray('__')).toEqual([]);
    });

    it('handles array of values', () => {
      expect(decodeDelimitedNumericArray(['1_2', '3_4'])).toEqual([1, 2]);
    });
  });

  describe('encodeNumericObject', () => {
    it('produces the correct value', () => {
      const input = { test: 55, foo: 94 };
      const expectedOutput = 'test-55_foo-94';
      expect(encodeNumericObject(input, '-', '_')).toBe(expectedOutput);
      expect(encodeNumericObject(undefined)).not.toBeDefined();
      expect(encodeNumericObject({})).not.toBeDefined();
    });
  });

  describe('decodeNumericObject', () => {
    it('produces the correct value', () => {
      const output = decodeNumericObject('foo-55_jim-100_iros-94');
      const expectedOutput = {
        foo: 55,
        jim: 100,
        iros: 94,
      };
      expect(output).toEqual(expectedOutput);
      expect(decodeNumericObject(undefined)).not.toBeDefined();
      expect(decodeNumericObject('')).not.toBeDefined();
    });

    it('handles malformed input', () => {
      expect(decodeNumericObject('foo-bar-jim-grill')).toEqual({
        foo: undefined,
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
