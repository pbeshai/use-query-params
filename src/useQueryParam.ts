import * as React from 'react';
import { parse as parseQueryString, ParsedQuery } from 'query-string';
import { QueryParamContext } from './QueryParamProvider';
import { StringParam } from './params';
import { updateUrlQuery } from './updateUrlQuery';
import { UrlUpdateType } from './types';

export interface QueryParamConfig<T> {
  encode: (value: T | null | undefined) => string | undefined;
  decode: (value: string) => T | undefined;
}

export const useQueryParam = <T>(
  name: string,
  paramConfig: QueryParamConfig<T> = StringParam as QueryParamConfig<any>,
  rawQuery?: ParsedQuery
): [T | undefined, (newValue: T, updateType?: UrlUpdateType) => void] => {
  const { history, location } = React.useContext(QueryParamContext);

  // read in the raw query
  if (!rawQuery) {
    rawQuery = parseQueryString(window.location.search) || {};
  }

  const encodedValue = rawQuery[name] as string;
  const decodedValue = paramConfig.decode(encodedValue);

  const changeValue = (newValue: T, updateType?: UrlUpdateType) => {
    const newEncodedValue = paramConfig.encode(newValue);

    updateUrlQuery({ [name]: newEncodedValue }, location, history, updateType);
  };

  return [decodedValue, changeValue];
};
