import { QueryParamConfigMap, StringParam } from 'serialize-query-params';
import { QueryParamOptions } from './options';
import { QueryParamConfigMapWithInherit } from './types';

export function processInheritedParams(
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
    if (param != null && typeof param === 'object') {
      paramConfigMap[key] = param;
      continue;
    }

    hasInherit = true;

    // default is StringParam
    paramConfigMap[key] = options.params?.[key] ?? StringParam;
  }

  if (!hasInherit) return paramConfigMapWithInherit as QueryParamConfigMap;

  return paramConfigMap;
}

export function expandWithInheritedParams(
  baseParamConfigMap: QueryParamConfigMap,
  paramKeys: string[],
  inheritedParams: QueryParamOptions['params'] | undefined
) {
  if (!inheritedParams || !paramKeys.length) return baseParamConfigMap;

  let paramConfigMap = { ...baseParamConfigMap };
  let hasInherit = false;
  for (const paramKey of paramKeys) {
    if (!Object.prototype.hasOwnProperty.call(paramConfigMap, paramKey)) {
      paramConfigMap[paramKey] = inheritedParams[paramKey];
      hasInherit = true;
    }
  }

  if (!hasInherit) return baseParamConfigMap;
  return paramConfigMap;
}
