import {
  QueryParamConfig,
  QueryParamConfigMap,
  StringParam,
} from 'serialize-query-params';
import { QueryParamOptions } from './options';
import { QueryParamConfigMapWithInherit } from './types';

/**
 * Convert inherit strings from a query param config to actual
 * parameters based on predefined ('inherited') mappings.
 * Defaults to StringParam.
 */
export function convertInheritedParamStringsToParams(
  paramConfigMapWithInherit: QueryParamConfigMapWithInherit,
  options: QueryParamOptions
): QueryParamConfigMap {
  const paramConfigMap: QueryParamConfigMap = {};
  let hasInherit = false;

  const hookKeys = Object.keys(paramConfigMapWithInherit);
  let paramKeys = hookKeys;

  // include known params if asked for explicitly, or no params were configured and we didn't
  // explicitly say not to
  const includeKnownParams =
    options.includeKnownParams ||
    (options.includeKnownParams !== false && hookKeys.length === 0);

  if (includeKnownParams) {
    const knownKeys = Object.keys(options.params ?? {});
    paramKeys.push(...knownKeys);
  }

  for (const key of paramKeys) {
    const param = paramConfigMapWithInherit[key];
    // does it have an existing parameter definition? use it
    if (param != null && typeof param === 'object') {
      paramConfigMap[key] = param;
      continue;
    }

    // otherwise, we have to inherit or use the default
    hasInherit = true;

    // default is StringParam
    paramConfigMap[key] = options.params?.[key] ?? StringParam;
  }

  // if we didn't inherit anything, just return the input
  if (!hasInherit) return paramConfigMapWithInherit as QueryParamConfigMap;

  return paramConfigMap;
}

/**
 * Extends a config to include params for all specified keys,
 * defaulting to StringParam if not found in the inheritedParams
 * map.
 */
export function extendParamConfigForKeys(
  baseParamConfigMap: QueryParamConfigMap,
  paramKeys: string[],
  inheritedParams?: QueryParamOptions['params'] | undefined,
  defaultParam?: QueryParamConfig<any> | undefined
) {
  // if we aren't inheriting anything or there are no params, return the input
  if (!inheritedParams || !paramKeys.length) return baseParamConfigMap;

  let paramConfigMap = { ...baseParamConfigMap };
  let hasInherit = false;
  for (const paramKey of paramKeys) {
    // if it is missing a parameter, fill it in
    if (!Object.prototype.hasOwnProperty.call(paramConfigMap, paramKey)) {
      paramConfigMap[paramKey] = inheritedParams[paramKey] ?? defaultParam;
      hasInherit = true;
    }
  }

  if (!hasInherit) return baseParamConfigMap;
  return paramConfigMap;
}
