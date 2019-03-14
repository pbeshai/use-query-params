import * as Serialize from './serialize';
import { QueryParamConfig } from './types';

/**
 * String values
 */
export const StringParam: QueryParamConfig<string> = {
  encode: Serialize.encodeString,
  decode: Serialize.decodeString,
};

/**
 * Numbers (integers or floats)
 */
export const NumberParam: QueryParamConfig<number> = {
  encode: Serialize.encodeNumber,
  decode: Serialize.decodeNumber,
};

/**
 * For flat objects where values are strings
 */
export const ObjectParam: QueryParamConfig<{
  [key: string]: string | number | undefined;
}> = {
  encode: Serialize.encodeObject,
  decode: Serialize.decodeObject,
};

/**
 * For flat arrays of strings
 */
export const ArrayParam: QueryParamConfig<(string | undefined)[]> = {
  encode: Serialize.encodeArray,
  decode: Serialize.decodeArray,
};

/**
 * For any type of data, encoded via JSON.stringify
 */
export const JsonParam: QueryParamConfig<any> = {
  encode: Serialize.encodeJson,
  decode: Serialize.decodeJson,
};

/**
 * For simple dates (YYYY-MM-DD)
 */
export const DateParam: QueryParamConfig<Date> = {
  encode: Serialize.encodeDate,
  decode: Serialize.decodeDate,
};

/**
 * For boolean values: 1 = true, 0 = false
 */
export const BooleanParam: QueryParamConfig<boolean> = {
  encode: Serialize.encodeBoolean,
  decode: Serialize.decodeBoolean,
};

/**
 * For flat objects where the values are numbers
 */
export const NumericObjectParam: QueryParamConfig<{
  [key: string]: number | undefined;
}> = {
  encode: Serialize.encodeNumericObject,
  decode: Serialize.decodeNumericObject,
};

/**
 * For flat arrays where the values are numbers
 */
export const NumericArrayParam: QueryParamConfig<(number | undefined)[]> = {
  encode: Serialize.encodeNumericArray,
  decode: Serialize.decodeNumericArray,
};
