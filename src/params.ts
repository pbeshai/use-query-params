import * as Serialize from './serialize';
import { QueryParamConfig } from './useQueryParam';

export const StringParam: QueryParamConfig<string> = {
  encode: Serialize.encodeString,
  decode: Serialize.decodeString,
};

export const NumberParam: QueryParamConfig<number> = {
  encode: Serialize.encodeNumber,
  decode: Serialize.decodeNumber,
};

export const ObjectParam: QueryParamConfig<{
  [key: string]: string | number | undefined;
}> = {
  encode: Serialize.encodeObject,
  decode: Serialize.decodeObject,
};
export const ArrayParam: QueryParamConfig<
  (string | undefined)[] | (number | undefined)[]
> = {
  encode: Serialize.encodeArray,
  decode: Serialize.decodeArray,
};
export const JsonParam: QueryParamConfig<any> = {
  encode: Serialize.encodeJson,
  decode: Serialize.decodeJson,
};
export const DateParam: QueryParamConfig<Date> = {
  encode: Serialize.encodeDate,
  decode: Serialize.decodeDate,
};
export const BooleanParam: QueryParamConfig<boolean> = {
  encode: Serialize.encodeBoolean,
  decode: Serialize.decodeBoolean,
};
export const NumericObjectParam: QueryParamConfig<{
  [key: string]: number | undefined;
}> = {
  encode: Serialize.encodeNumericObject,
  decode: Serialize.decodeNumericObject,
};
export const NumericArrayParam: QueryParamConfig<(number | undefined)[]> = {
  encode: Serialize.encodeNumericArray,
  decode: Serialize.decodeNumericArray,
};
