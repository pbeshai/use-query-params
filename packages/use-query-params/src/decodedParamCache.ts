type EncodedValue = string | (string | null)[] | null | undefined;

type CachedParam = {
  stringified: EncodedValue;
  decoded: any;
  decode: Function;
};

/**
 * simple cache that keeps values around so long as something
 * has registered interest in it (typically via calling useQueryParams).
 * Caches based on the stringified value as the key and the
 * last passed in decode function.
 */
export class DecodedParamCache {
  private paramsMap: Map<string, CachedParam>;
  private registeredParams: Map<string, number>;

  constructor() {
    this.paramsMap = new Map();
    this.registeredParams = new Map();
  }

  set(
    param: string,
    stringifiedValue: EncodedValue,
    decodedValue: any,
    decode: Function
  ) {
    this.paramsMap.set(param, {
      stringified: stringifiedValue,
      decoded: decodedValue,
      decode,
    });
  }

  /**
   * A param has been cached if the stringified value and decode function matches
   */
  has(param: string, stringifiedValue: EncodedValue, decode?: Function) {
    if (!this.paramsMap.has(param)) return false;
    const cachedParam = this.paramsMap.get(param);
    if (!cachedParam) return false;

    return (
      cachedParam.stringified === stringifiedValue &&
      (decode == null || cachedParam.decode === decode)
    );
  }

  get(param: string) {
    if (this.paramsMap.has(param)) return this.paramsMap.get(param)?.decoded;
    return undefined;
  }

  /**
   * Register interest in a set of param names. When these go to 0 they are cleaned out.
   */
  registerParams(paramNames: string[]) {
    for (const param of paramNames) {
      const currValue = this.registeredParams.get(param) || 0;
      this.registeredParams.set(param, currValue + 1);
    }
  }

  /**
   * Unregister interest in a set of param names. If there is no remaining interest,
   * remove the decoded value from the cache to prevent memory leaks.
   */
  unregisterParams(paramNames: string[]) {
    for (const param of paramNames) {
      const value = (this.registeredParams.get(param) || 0) - 1;
      if (value <= 0) {
        this.registeredParams.delete(param);
        if (this.paramsMap.has(param)) {
          this.paramsMap.delete(param);
        }
      } else {
        this.registeredParams.set(param, value);
      }
    }
  }

  clear() {
    this.paramsMap.clear();
    this.registeredParams.clear();
  }
}

export const decodedParamCache = new DecodedParamCache();
