/** tuple comprising [stringified value, decoded value] */
type EncodedValue = string | (string | null)[] | null | undefined;

type CachedParam = {
  stringified: EncodedValue;
  decoded: any;
  decode: Function;
};

export class DecodedParamCache {
  private paramsMap: Map<string, CachedParam>;
  constructor() {
    this.paramsMap = new Map();
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
}

export const decodedParamCache = new DecodedParamCache();
