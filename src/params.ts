import * as Serialize from './serialize';
import { QueryParamConfig } from './types';

/**
 * String values
 */
export const StringParam: QueryParamConfig<
  string | null | undefined,
  string | undefined
> = {
  encode: Serialize.encodeString,
  decode: Serialize.decodeString,
};

/**
 * Numbers (integers or floats)
 */
export const NumberParam: QueryParamConfig<
  number | null | undefined,
  number | undefined
> = {
  encode: Serialize.encodeNumber,
  decode: Serialize.decodeNumber,
};

/**
 * For flat objects where values are strings
 */
export const ObjectParam: QueryParamConfig<
  | {
      [key: string]: string | undefined;
    }
  | null
  | undefined,
  { [key: string]: string | undefined } | undefined
> = {
  encode: Serialize.encodeObject,
  decode: Serialize.decodeObject,
};

/**
 * For flat arrays of strings, filters out undefined values during decode
 */
export const ArrayParam: QueryParamConfig<
  string[] | null | undefined,
  string[] | undefined
> = {
  encode: Serialize.encodeArray,
  decode: Serialize.decodeArray,
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
  Date | undefined
> = {
  encode: Serialize.encodeDate,
  decode: Serialize.decodeDate,
};

/**
 * For boolean values: 1 = true, 0 = false
 */
export const BooleanParam: QueryParamConfig<
  boolean | null | undefined,
  boolean | undefined
> = {
  encode: Serialize.encodeBoolean,
  decode: Serialize.decodeBoolean,
};

/**
 * For flat objects where the values are numbers
 */
export const NumericObjectParam: QueryParamConfig<
  | {
      [key: string]: number | undefined;
    }
  | null
  | undefined,
  { [key: string]: number | undefined } | undefined
> = {
  encode: Serialize.encodeNumericObject,
  decode: Serialize.decodeNumericObject,
};

/**
 * For flat arrays where the values are numbers, filters out undefined values during decode
 */
export const NumericArrayParam: QueryParamConfig<
  number[] | null | undefined,
  number[] | undefined
> = {
  encode: Serialize.encodeNumericArray,
  decode: Serialize.decodeNumericArray,
};
