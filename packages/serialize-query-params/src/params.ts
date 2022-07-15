import * as Serialize from './serialize';
import { QueryParamConfig } from './types';

/**
 * String values
 */
export const StringParam: QueryParamConfig<
  string | null | undefined,
  string | null | undefined
> = {
  encode: Serialize.encodeString,
  decode: Serialize.decodeString,
};

/**
 * String enum
 */
export const createEnumParam = <T extends string>(
  enumValues: T[]
): QueryParamConfig<T | null | undefined, T | null | undefined> => ({
  encode: Serialize.encodeString,
  decode: (input) => Serialize.decodeEnum(input, enumValues),
});

/**
 * Array enum
 */
export const createEnumArrayParam = <T extends string>(
  enumValues: T[]
): QueryParamConfig<T[] | null | undefined, T[] | null | undefined> => ({
  encode: (text) =>
    Serialize.encodeArray(text == null || Array.isArray(text) ? text : [text]),
  decode: (input) => Serialize.decodeArrayEnum(input, enumValues),
});

/**
 * Array delimited enum
 */
export const createEnumDelimitedArrayParam = <T extends string>(
  enumValues: T[],
  entrySeparator = '_'
): QueryParamConfig<T[] | null | undefined, T[] | null | undefined> => ({
  encode: (text) =>
    Serialize.encodeDelimitedArray(
      text == null || Array.isArray(text) ? text : [text],
      entrySeparator
    ),
  decode: (input) =>
    Serialize.decodeDelimitedArrayEnum(input, enumValues, entrySeparator),
});

/**
 * Numbers (integers or floats)
 */
export const NumberParam: QueryParamConfig<
  number | null | undefined,
  number | null | undefined
> = {
  encode: Serialize.encodeNumber,
  decode: Serialize.decodeNumber,
};

/**
 * For flat objects where values are strings
 */
export const ObjectParam: QueryParamConfig<
  { [key: string]: string | undefined } | null | undefined,
  { [key: string]: string | undefined } | null | undefined
> = {
  encode: Serialize.encodeObject,
  decode: Serialize.decodeObject,
};

/**
 * For flat arrays of strings, filters out undefined values during decode
 */
export const ArrayParam: QueryParamConfig<
  (string | null)[] | null | undefined,
  (string | null)[] | null | undefined
> = {
  encode: Serialize.encodeArray,
  decode: Serialize.decodeArray,
};

/**
 * For flat arrays of strings, filters out undefined values during decode
 */
export const NumericArrayParam: QueryParamConfig<
  (number | null)[] | null | undefined,
  (number | null)[] | null | undefined
> = {
  encode: Serialize.encodeNumericArray,
  decode: Serialize.decodeNumericArray,
};

/**
 * For any type of data, encoded via JSON.stringify
 */
export const JsonParam: QueryParamConfig<any, any> = {
  encode: Serialize.encodeJson,
  decode: Serialize.decodeJson,
};

/**
 * For simple dates (YYYY-MM-DD)
 */
export const DateParam: QueryParamConfig<
  Date | null | undefined,
  Date | null | undefined
> = {
  encode: Serialize.encodeDate,
  decode: Serialize.decodeDate,
  equals: (
    valueA: Date | null | undefined,
    valueB: Date | null | undefined
  ) => {
    if (valueA === valueB) return true;
    if (valueA == null || valueB == null) return valueA === valueB;

    // ignore time of day
    return (
      valueA.getFullYear() === valueB.getFullYear() &&
      valueA.getMonth() === valueB.getMonth() &&
      valueA.getDate() === valueB.getDate()
    );
  },
};

/**
 * For dates in simplified extended ISO format (YYYY-MM-DDTHH:mm:ss.sssZ or ±YYYYYY-MM-DDTHH:mm:ss.sssZ)
 */
export const DateTimeParam: QueryParamConfig<
  Date | null | undefined,
  Date | null | undefined
> = {
  encode: Serialize.encodeDateTime,
  decode: Serialize.decodeDateTime,
  equals: (
    valueA: Date | null | undefined,
    valueB: Date | null | undefined
  ) => {
    if (valueA === valueB) return true;
    if (valueA == null || valueB == null) return valueA === valueB;

    return valueA.valueOf() === valueB.valueOf();
  },
};

/**
 * For boolean values: 1 = true, 0 = false
 */
export const BooleanParam: QueryParamConfig<
  boolean | null | undefined,
  boolean | null | undefined
> = {
  encode: Serialize.encodeBoolean,
  decode: Serialize.decodeBoolean,
};

/**
 * For flat objects where the values are numbers
 */
export const NumericObjectParam: QueryParamConfig<
  { [key: string]: number | null | undefined } | null | undefined,
  { [key: string]: number | null | undefined } | null | undefined
> = {
  encode: Serialize.encodeNumericObject,
  decode: Serialize.decodeNumericObject,
};

/**
 * For flat arrays of strings, filters out undefined values during decode
 */
export const DelimitedArrayParam: QueryParamConfig<
  (string | null)[] | null | undefined,
  (string | null)[] | null | undefined
> = {
  encode: Serialize.encodeDelimitedArray,
  decode: Serialize.decodeDelimitedArray,
};

/**
 * For flat arrays where the values are numbers, filters out undefined values during decode
 */
export const DelimitedNumericArrayParam: QueryParamConfig<
  (number | null)[] | null | undefined,
  (number | null)[] | null | undefined
> = {
  encode: Serialize.encodeDelimitedNumericArray,
  decode: Serialize.decodeDelimitedNumericArray,
};
