import { QueryParamConfig } from './types';

/**
 * Wrap a given parameter with a default value when undefined or null (optionally, default includes null)
 * @param param QueryParamConfig - { encode, decode} to serialize a parameter
 * @param defaultValue A default value
 * @param includeNull
 */
export function withDefault<D, DefaultType extends D2, D2 = D>(
  param: QueryParamConfig<D, D2>,
  defaultValue: DefaultType,
  includeNull?: false | undefined
): QueryParamConfig<D, Exclude<D2, undefined> | DefaultType>;
export function withDefault<D, DefaultType extends D2, D2 = D>(
  param: QueryParamConfig<D, D2>,
  defaultValue: DefaultType,
  includeNull?: true
): QueryParamConfig<D, Exclude<D2, null | undefined> | DefaultType>;
export function withDefault<D, DefaultType extends D2, D2 = D>(
  param: QueryParamConfig<D, D2>,
  defaultValue: DefaultType,
  includeNull: boolean = true
): QueryParamConfig<D, any | DefaultType> {
  const decodeWithDefault = (
    ...args: Parameters<typeof param.decode>
  ): Exclude<D2, null | undefined> | Exclude<D2, undefined> | DefaultType => {
    const decodedValue = param.decode(...args);

    if (decodedValue === undefined) {
      return defaultValue;
    }
    if (includeNull) {
      if (decodedValue === null) {
        return defaultValue;
      } else {
        return decodedValue as Exclude<D2, undefined>;
      }
    }

    return decodedValue as Exclude<D2, undefined | null>;
  };

  // note we add `default` into the param for other tools to introspect
  return { ...param, default: defaultValue, decode: decodeWithDefault };
}
export default withDefault;
