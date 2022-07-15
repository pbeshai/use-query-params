import { expectType } from 'tsd';
import { DecodedValueMap, StringParam, NumberParam, withDefault } from '..';

const queryParamConfig = { str: StringParam, num: NumberParam };
const decodedValueMap: DecodedValueMap<typeof queryParamConfig> = {
  str: queryParamConfig.str.decode('foo'),
  num: queryParamConfig.num.decode('9'),
};
expectType<{ str: string | null | undefined; num: number | null | undefined }>(
  decodedValueMap
);

const queryParamConfig2 = {
  str: withDefault(StringParam, 'x', false),
  num: withDefault(NumberParam, 0),
};
const decodedValueMap2: DecodedValueMap<typeof queryParamConfig2> = {
  str: queryParamConfig2.str.decode('foo'),
  num: queryParamConfig2.num.decode('9'),
};
expectType<{ str: string | null; num: number }>(decodedValueMap2);
