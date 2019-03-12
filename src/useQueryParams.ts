import * as React from 'react';
import { parse as parseQueryString } from 'query-string';
import { useQueryParam, QueryParamConfig } from './useQueryParam';

interface QueryParamConfigMap {
  [paramName: string]: QueryParamConfig<any>;
}

type DecodedValueMap<QPCMap extends QueryParamConfigMap> = {
  [P in keyof QPCMap]: ReturnType<QPCMap[P]['decode']>
};

type SetQuery<QPCMap extends QueryParamConfigMap> = (
  changes: Partial<DecodedValueMap<QPCMap>>,
  updateType?: string
) => void;

export const useQueryParams = <QPCMap extends QueryParamConfigMap>(
  paramConfigMap: QPCMap
): [DecodedValueMap<QPCMap>, SetQuery<QPCMap>] => {
  const rawQuery = parseQueryString(window.location.search) || {};

  // parse each parameter

  const paramNames = Object.keys(paramConfigMap);
  const decodedValues: Partial<DecodedValueMap<QPCMap>> = {};
  const changeValues: any = {};
  for (const paramName of paramNames) {
    const [decodedValue, changeValue] = useQueryParam(
      paramName,
      paramConfigMap[paramName],
      rawQuery
    );
    decodedValues[paramName] = decodedValue;
    changeValues[paramName] = changeValue;
  }

  console.log('decoded values xxx', decodedValues);
  const setQuery = (
    changes: Partial<DecodedValueMap<QPCMap>>,
    updateType?: string
  ) => {
    console.log('in theory this bulk changes', changes, updateType);
  };

  return [decodedValues as DecodedValueMap<QPCMap>, setQuery];
  // return useQueryParam('zz''zzz'), rawQuery);
};

export default useQueryParams;
