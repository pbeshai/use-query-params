import {
  StringParam,
  NumberParam,
  ObjectParam,
  ArrayParam,
  NumericArrayParam,
  JsonParam,
  DateParam,
  BooleanParam,
  NumericObjectParam,
  DelimitedArrayParam,
  DelimitedNumericArrayParam,
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
  });
});
