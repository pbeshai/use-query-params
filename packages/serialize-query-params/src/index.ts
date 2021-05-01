export { withDefault } from './withDefault';

export {
  encodeDate,
  decodeDate,
  encodeBoolean,
  decodeBoolean,
  encodeNumber,
  decodeNumber,
  encodeString,
  decodeString,
  decodeEnum,
  encodeJson,
  decodeJson,
  encodeArray,
  decodeArray,
  encodeNumericArray,
  decodeNumericArray,
  encodeDelimitedArray,
  decodeDelimitedArray,
  encodeDelimitedNumericArray,
  decodeDelimitedNumericArray,
  encodeObject,
  decodeObject,
  encodeNumericObject,
  decodeNumericObject,
} from './serialize';

export {
  StringParam,
  NumberParam,
  ObjectParam,
  ArrayParam,
  NumericArrayParam,
  JsonParam,
  DateParam,
  DateTimeParam,
  BooleanParam,
  NumericObjectParam,
  DelimitedArrayParam,
  DelimitedNumericArrayParam,
  createEnumParam,
} from './params';

export {
  EncodedQuery,
  QueryParamConfig,
  QueryParamConfigMap,
  DecodedValueMap,
  EncodedValueMap,
} from './types';

export {
  updateLocation,
  updateInLocation,
  ExtendedStringifyOptions,
  transformSearchStringJsonSafe,
} from './updateLocation';
export { encodeQueryParams } from './encodeQueryParams';
export { decodeQueryParams } from './decodeQueryParams';

if (process.env.NODE_ENV !== 'production' && typeof require === 'function') {
  /*
   * run checks to ensure a valid version of query-string is installed
   * see https://github.com/pbeshai/use-query-params/issues/127 for discussion
   */
  const queryStringVersion = require('query-string/package.json').version;
  // simple check of versions since we don't anticipate any new minor v5s and
  // don't want to require the semver package as a dependency for just a simple
  // dev check.
  const validQueryStringInstalled =
    /^5.1.[1-9][0-9]*/.test(queryStringVersion) ||
    /^6\./.test(queryStringVersion) || /^7\./.test(queryStringVersion);
  if (!validQueryStringInstalled) {
    throw new Error(
      `serialize-query-params requires query-string ^5.1.1 || ^6, ` +
        `but ${queryStringVersion} is installed. Note: you may also ` +
        `see this message if you're using use-query-params.`
    );
  }
}
