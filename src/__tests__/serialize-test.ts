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
  encodeObject,
  decodeObject,
  encodeNumericObject,
  encodeNumericArray,
  decodeNumericObject,
  decodeNumericArray,
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
  });

  describe('encodeArray', () => {
    it('produces the correct value', () => {
      const input = ['a', 'b', 'c'];
      expect(encodeArray(input)).toBe('a_b_c');
      expect(encodeArray(undefined)).not.toBeDefined();
    });
  });

  describe('decodeArray', () => {
    it('produces the correct value', () => {
      const output = decodeArray('a_b_c');
      const expectedOutput = ['a', 'b', 'c'];

      expect(output).toEqual(expectedOutput);
      expect(decodeArray(undefined)).not.toBeDefined();
      expect(decodeArray('')).not.toBeDefined();
    });

    it('handles empty values', () => {
      expect(decodeArray('__')).toEqual([undefined, undefined, undefined]);
    });
  });

  describe('encodeObject', () => {
    it('produces the correct value', () => {
      const input = { test: 'bar', foo: 94 };
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
  });

  describe('encodeNumericArray', () => {
    it('produces the correct value', () => {
      const input = [9, 4, 0];
      expect(encodeNumericArray(input)).toBe('9_4_0');
      expect(encodeNumericArray(undefined)).not.toBeDefined();
    });
  });

  describe('decodeNumericArray', () => {
    it('produces the correct value', () => {
      const output = decodeNumericArray('9_4_0');
      const expectedOutput = [9, 4, 0];

      expect(output).toEqual(expectedOutput);
      expect(decodeNumericArray(undefined)).not.toBeDefined();
      expect(decodeNumericArray('')).not.toBeDefined();
    });

    it('handles empty values', () => {
      expect(decodeNumericArray('__')).toEqual([
        undefined,
        undefined,
        undefined,
      ]);
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
  });
});
