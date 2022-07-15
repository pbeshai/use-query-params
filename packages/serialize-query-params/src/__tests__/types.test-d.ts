import { expectType } from 'tsd';
import {
  DecodedValueMap,
  StringParam,
  NumberParam,
  ArrayParam,
  withDefault,
  createEnumParam,
} from '..';

// test basic decoded values
const queryParamConfig = { str: StringParam, num: NumberParam };
const decodedValueMap: DecodedValueMap<typeof queryParamConfig> = {
  str: queryParamConfig.str.decode('foo'),
  num: queryParamConfig.num.decode('9'),
};
expectType<{ str: string | null | undefined; num: number | null | undefined }>(
  decodedValueMap
);

// test decoded values with defaults including null and not
const queryParamConfig2 = {
  str: withDefault(StringParam, 'x', false),
  num: withDefault(NumberParam, 0),
};
const decodedValueMap2: DecodedValueMap<typeof queryParamConfig2> = {
  str: queryParamConfig2.str.decode('foo'),
  num: queryParamConfig2.num.decode('9'),
};
expectType<{ str: string | null; num: number }>(decodedValueMap2);

// test enum param with default
const MyEnumParam = createEnumParam(['foo', 'bar']);
const queryParamConfig3 = {
  enum: withDefault(MyEnumParam, 'foo'),
};

const decodedValueMap3: DecodedValueMap<typeof queryParamConfig3> = {
  enum: queryParamConfig3.enum.decode('foo'),
};
expectType<{ enum: 'foo' | 'bar' }>(decodedValueMap3);

// test enum param with default array type
const queryParamConfig4 = {
  arr: withDefault(ArrayParam, ['a', 'b']),
};

const decodedValueMap4: DecodedValueMap<typeof queryParamConfig4> = {
  arr: queryParamConfig4.arr.decode(['x', 'b']),
};
expectType<{ arr: string[] | (string | null)[] }>(decodedValueMap4);
