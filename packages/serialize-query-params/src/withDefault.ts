import { QueryParamConfig } from './types';

// take from ts-toolbelt
// https://github.com/millsp/ts-toolbelt/blob/master/sources/Function/Narrow.ts
type Try<A1 extends any, A2 extends any, Catch = never> = A1 extends A2
  ? A1
  : Catch;

type Narrowable = string | number | bigint | boolean;

/**
 * @hidden
 */
type NarrowRaw<A> =
  | (A extends [] ? [] : never)
  | (A extends Narrowable ? A : never)
  | {
      [K in keyof A]: A[K] extends Function ? A[K] : NarrowRaw<A[K]>;
    };

type Narrow<A extends any> = Try<A, [], NarrowRaw<A>>;

/**
 * Wrap a given parameter with a default value when undefined or null (optionally, default includes null)
 * @param param QueryParamConfig - { encode, decode} to serialize a parameter
 * @param defaultValue A default value
 * @param includeNull
 */
export function withDefault<D, DefaultType extends D2, D2 = D>(
  param: QueryParamConfig<D, D2>,
  defaultValue: Narrow<DefaultType>,
  includeNull?: false | undefined
): QueryParamConfig<D, Exclude<D2, undefined> | DefaultType>;
export function withDefault<D, DefaultType extends D2, D2 = D>(
  param: QueryParamConfig<D, D2>,
  defaultValue: Narrow<DefaultType>,
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
