/**
 * Interprets an encoded string and returns either the string or null/undefined if not available.
 * Ignores array inputs (takes just first element in array)
 * @param input encoded string
 */
function getEncodedValue(
  input: string | (string | null)[] | null | undefined,
  allowEmptyString?: boolean
): string | null | undefined {
  if (input == null) {
    return input;
  }
  // '' or []
  if (
    input.length === 0 &&
    (!allowEmptyString || (allowEmptyString && input !== ''))
  ) {
    return null;
  }

  const str = input instanceof Array ? input[0] : input;
  if (str == null) {
    return str;
  }
  if (!allowEmptyString && str === '') {
    return null;
  }

  return str;
}

/**
 * Interprets an encoded string and return null/undefined or an array with
 * the encoded string contents
 * @param input encoded string
 */
function getEncodedValueArray(
  input: string | (string | null)[] | null | undefined
): (string | null)[] | null | undefined {
  if (input == null) {
    return input;
  }

  return input instanceof Array ? input : input === '' ? [] : [input];
}

/**
 * Encodes a date as a string in YYYY-MM-DD format.
 *
 * @param {Date} date
 * @return {String} the encoded date
 */
export function encodeDate(
  date: Date | null | undefined
): string | null | undefined {
  if (date == null) {
    return date;
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}-${month < 10 ? `0${month}` : month}-${
    day < 10 ? `0${day}` : day
  }`;
}

/**
 * Converts a date in the format 'YYYY-mm-dd...' into a proper date, because
 * new Date() does not do that correctly. The date can be as complete or incomplete
 * as necessary (aka, '2015', '2015-10', '2015-10-01').
 * It will not work for dates that have times included in them.
 *
 * If an array is provided, only the first entry is used.
 *
 * @param  {String} input String date form like '2015-10-01'
 * @return {Date} parsed date
 */
export function decodeDate(
  input: string | (string | null)[] | null | undefined
): Date | null | undefined {
  const dateString = getEncodedValue(input);
  if (dateString == null) return dateString;

  const parts = dateString.split('-') as any;
  // may only be a year so won't even have a month
  if (parts[1] != null) {
    parts[1] -= 1; // Note: months are 0-based
  } else {
    // just a year, set the month and day to the first
    parts[1] = 0;
    parts[2] = 1;
  }

  const decoded = new Date(...(parts as [number, number, number]));

  if (isNaN(decoded.getTime())) {
    return null;
  }

  return decoded;
}

/**
 * Encodes a date as a string in ISO 8601 ("2019-05-28T10:58:40Z") format.
 *
 * @param {Date} date
 * @return {String} the encoded date
 */
export function encodeDateTime(
  date: Date | null | undefined
): string | null | undefined {
  if (date == null) {
    return date;
  }

  return date.toISOString();
}

/**
 * Converts a date in the https://en.wikipedia.org/wiki/ISO_8601 format.
 * For allowed inputs see specs:
 *  - https://tools.ietf.org/html/rfc2822#page-14
 *  - http://www.ecma-international.org/ecma-262/5.1/#sec-15.9.1.15
 *
 * If an array is provided, only the first entry is used.
 *
 * @param  {String} input String date form like '1995-12-17T03:24:00'
 * @return {Date} parsed date
 */
export function decodeDateTime(
  input: string | (string | null)[] | null | undefined
): Date | null | undefined {
  const dateString = getEncodedValue(input);
  if (dateString == null) return dateString;

  const decoded = new Date(dateString);

  if (isNaN(decoded.getTime())) {
    return null;
  }

  return decoded;
}

/**
 * Encodes a boolean as a string. true -> "1", false -> "0".
 *
 * @param {Boolean} bool
 * @return {String} the encoded boolean
 */
export function encodeBoolean(
  bool: boolean | null | undefined
): string | null | undefined {
  if (bool == null) {
    return bool;
  }

  return bool ? '1' : '0';
}

/**
 * Decodes a boolean from a string. "1" -> true, "0" -> false.
 * Everything else maps to undefined.
 *
 * If an array is provided, only the first entry is used.
 *
 * @param {String} input the encoded boolean string
 * @return {Boolean} the boolean value
 */
export function decodeBoolean(
  input: string | (string | null)[] | null | undefined
): boolean | null | undefined {
  const boolStr = getEncodedValue(input);
  if (boolStr == null) return boolStr;

  if (boolStr === '1') {
    return true;
  } else if (boolStr === '0') {
    return false;
  }

  return null;
}

/**
 * Encodes a number as a string.
 *
 * @param {Number} num
 * @return {String} the encoded number
 */
export function encodeNumber(
  num: number | null | undefined
): string | null | undefined {
  if (num == null) {
    return num;
  }

  return String(num);
}

/**
 * Decodes a number from a string. If the number is invalid,
 * it returns undefined.
 *
 * If an array is provided, only the first entry is used.
 *
 * @param {String} input the encoded number string
 * @return {Number} the number value
 */
export function decodeNumber(
  input: string | (string | null)[] | null | undefined
): number | null | undefined {
  const numStr = getEncodedValue(input);
  if (numStr == null) return numStr;
  if (numStr === '') return null;

  const result = +numStr;
  return result;
}

/**
 * Encodes a string while safely handling null and undefined values.
 *
 * @param {String} str a string to encode
 * @return {String} the encoded string
 */
export function encodeString(
  str: string | (string | null)[] | null | undefined
): string | null | undefined {
  if (str == null) {
    return str;
  }

  return String(str);
}

/**
 * Decodes a string while safely handling null and undefined values.
 *
 * If an array is provided, only the first entry is used.
 *
 * @param {String} input the encoded string
 * @return {String} the string value
 */
export function decodeString(
  input: string | (string | null)[] | null | undefined
): string | null | undefined {
  const str = getEncodedValue(input, true);
  if (str == null) return str;

  return String(str);
}

/**
 * Decodes an enum value while safely handling null and undefined values.
 *
 * If an array is provided, only the first entry is used.
 *
 * @param {String} input the encoded string
 * @param {String[]} enumValues allowed enum values
 * @return {String} the string value from enumValues
 */
export function decodeEnum<T extends string>(
  input: string | (string | null)[] | null | undefined,
  enumValues: T[]
): T | null | undefined {
  const str = decodeString(input);
  if (str == null) return str;
  return enumValues.includes(str as any) ? (str as T) : undefined;
}

/**
 * Decodes an enum value from arrays while safely handling null and undefined values.
 *
 * @template T
 * @param {String} input the encoded string
 * @param {T[]} enumValues allowed enum values
 * @return {T[]} the string value from enumValues
 */
export function decodeArrayEnum<T extends string>(
  input: string | (string | null)[] | null | undefined,
  enumValues: T[]
): T[] | null | undefined {
  const arr = decodeArray(input);
  if (arr == null) return arr;
  if (!arr.length) return undefined;
  return arr.every((str) => str != null && enumValues.includes(str as T))
    ? (arr as T[])
    : undefined;
}

/**
 * Decodes an enum value from arrays while safely handling null and undefined values.
 *
 * @template T
 * @param {String} input the encoded string
 * @param {T[]} enumValues allowed enum values
 * @param entrySeparator The array as a string with elements joined by the
 * entry separator
 * @return {T[]} the string value from enumValues
 */
export function decodeDelimitedArrayEnum<T extends string>(
  input: string | (string | null)[] | null | undefined,
  enumValues: T[],
  entrySeparator = '_'
): T[] | null | undefined {
  if (input != null && Array.isArray(input) && !input.length) return undefined;
  const arr = decodeDelimitedArray(input, entrySeparator);
  return decodeArrayEnum(arr, enumValues);
}

/**
 * Encodes anything as a JSON string.
 *
 * @param {Any} any The thing to be encoded
 * @return {String} The JSON string representation of any
 */
export function encodeJson(
  any: any | null | undefined
): string | null | undefined {
  if (any == null) {
    return any;
  }

  return JSON.stringify(any);
}

/**
 * Decodes a JSON string into javascript
 *
 * If an array is provided, only the first entry is used.
 *
 * @param {String} input The JSON string representation
 * @return {Any} The javascript representation
 */
export function decodeJson(
  input: string | (string | null)[] | null | undefined
): any | null | undefined {
  const jsonStr = getEncodedValue(input);
  if (jsonStr == null) return jsonStr;

  let result = null;
  try {
    result = JSON.parse(jsonStr);
  } catch (e) {
    /* ignore errors, returning undefined */
  }

  return result;
}

/**
 * Encodes an array as a JSON string.
 *
 * @param {Array} array The array to be encoded
 * @return {String[]} The array of strings to be put in the URL
 * as repeated query parameters
 */
export function encodeArray(
  array: (string | null)[] | null | undefined
): (string | null)[] | null | undefined {
  if (array == null) {
    return array;
  }

  return array;
}

/**
 * Decodes an array or singular value and returns it as an array
 * or undefined if falsy. Filters out undefined values.
 *
 * @param {String | Array} input The input value
 * @return {Array} The javascript representation
 */
export function decodeArray(
  input: string | (string | null)[] | null | undefined
): (string | null)[] | null | undefined {
  const arr = getEncodedValueArray(input);
  if (arr == null) return arr;

  return arr;
}

/**
 * Encodes a numeric array as a JSON string.
 *
 * @param {Array} array The array to be encoded
 * @return {String[]} The array of strings to be put in the URL
 * as repeated query parameters
 */
export function encodeNumericArray(
  array: (number | null)[] | null | undefined
): (string | null)[] | null | undefined {
  if (array == null) {
    return array;
  }

  return array.map(String);
}

/**
 * Decodes an array or singular value and returns it as an array
 * or undefined if falsy. Filters out undefined and NaN values.
 *
 * @param {String | Array} input The input value
 * @return {Array} The javascript representation
 */
export function decodeNumericArray(
  input: string | (string | null)[] | null | undefined
): (number | null)[] | null | undefined {
  const arr = decodeArray(input);
  if (arr == null) return arr;

  return arr.map((d) => (d === '' || d == null ? null : +d));
}

/**
 * Encodes an array as a delimited string. For example,
 * ['a', 'b'] -> 'a_b' with entrySeparator='_'
 *
 * @param array The array to be encoded
 * @param entrySeparator The string used to delimit entries
 * @return The array as a string with elements joined by the
 * entry separator
 */
export function encodeDelimitedArray(
  array: (string | null)[] | null | undefined,
  entrySeparator = '_'
): string | null | undefined {
  if (array == null) {
    return array;
  }

  return array.join(entrySeparator);
}

/**
 * Decodes a delimited string into javascript array. For example,
 * 'a_b' -> ['a', 'b'] with entrySeparator='_'
 *
 * If an array is provided as input, only the first entry is used.
 *
 * @param {String} input The JSON string representation
 * @param entrySeparator The array as a string with elements joined by the
 * entry separator
 * @return {Array} The javascript representation
 */
export function decodeDelimitedArray(
  input: string | (string | null)[] | null | undefined,
  entrySeparator = '_'
): (string | null)[] | null | undefined {
  const arrayStr = getEncodedValue(input, true);
  if (arrayStr == null) return arrayStr;
  if (arrayStr === '') return [];

  return arrayStr.split(entrySeparator);
}

/**
 * Encodes a numeric array as a delimited string. (alias of encodeDelimitedArray)
 * For example, [1, 2] -> '1_2' with entrySeparator='_'
 *
 * @param {Array} array The array to be encoded
 * @return {String} The JSON string representation of array
 */
export const encodeDelimitedNumericArray = encodeDelimitedArray as (
  array: (number | null)[] | null | undefined,
  entrySeparator?: string
) => string | null | undefined;

/**
 * Decodes a delimited string into javascript array where all entries are numbers
 * For example, '1_2' -> [1, 2] with entrySeparator='_'
 *
 * If an array is provided as input, only the first entry is used.
 *
 * @param {String} jsonStr The JSON string representation
 * @return {Array} The javascript representation
 */
export function decodeDelimitedNumericArray(
  arrayStr: string | (string | null)[] | null | undefined,
  entrySeparator = '_'
): (number | null)[] | null | undefined {
  const decoded = decodeDelimitedArray(arrayStr, entrySeparator);
  if (decoded == null) return decoded;

  return decoded.map((d) => (d === '' || d == null ? null : +d));
}

/**
 * Encode simple objects as readable strings. Works only for simple,
 * flat objects where values are numbers, strings.
 *
 * For example { foo: bar, boo: baz } -> "foo-bar_boo-baz"
 *
 * @param {Object} object The object to encode
 * @param {String} keyValSeparator="-" The separator between keys and values
 * @param {String} entrySeparator="_" The separator between entries
 * @return {String} The encoded object
 */
export function encodeObject(
  obj: { [key: string]: string | null | number | undefined } | null | undefined,
  keyValSeparator = '-',
  entrySeparator = '_'
): string | null | undefined {
  if (obj == null) return obj; // null or undefined
  if (!Object.keys(obj).length) return ''; // {} case

  return Object.keys(obj)
    .map((key) => `${key}${keyValSeparator}${obj[key]}`)
    .join(entrySeparator);
}

/**
 * Decodes a simple object to javascript. Currently works only for simple,
 * flat objects where values are strings.
 *
 * For example "foo-bar_boo-baz" -> { foo: bar, boo: baz }
 *
 * If an array is provided as input, only the first entry is used.
 *
 * @param {String} input The object string to decode
 * @param {String} keyValSeparator="-" The separator between keys and values
 * @param {String} entrySeparator="_" The separator between entries
 * @return {Object} The javascript object
 */
export function decodeObject(
  input: string | (string | null)[] | null | undefined,
  keyValSeparator = '-',
  entrySeparator = '_'
): { [key: string]: string } | null | undefined {
  const objStr = getEncodedValue(input, true);
  if (objStr == null) return objStr;
  if (objStr === '') return {};

  const obj: { [key: string]: string } = {};

  const keyValSeparatorRegExp = new RegExp(`${keyValSeparator}(.*)`);
  objStr.split(entrySeparator).forEach((entryStr) => {
    const [key, value] = entryStr.split(keyValSeparatorRegExp);
    obj[key] = value;
  });

  return obj;
}

/**
 * Encode simple objects as readable strings. Alias of encodeObject.
 *
 * For example { foo: 123, boo: 521 } -> "foo-123_boo-521"
 *
 * @param {Object} object The object to encode
 * @param {String} keyValSeparator="-" The separator between keys and values
 * @param {String} entrySeparator="_" The separator between entries
 * @return {String} The encoded object
 */
export const encodeNumericObject = encodeObject as (
  obj: { [key: string]: number | null | undefined } | null | undefined,
  keyValSeparator?: string,
  entrySeparator?: string
) => string | null | undefined;

/**
 * Decodes a simple object to javascript where all values are numbers.
 * Currently works only for simple, flat objects.
 *
 * For example "foo-123_boo-521" -> { foo: 123, boo: 521 }
 *
 * If an array is provided as input, only the first entry is used.
 *
 * @param {String} input The object string to decode
 * @param {String} keyValSeparator="-" The separator between keys and values
 * @param {String} entrySeparator="_" The separator between entries
 * @return {Object} The javascript object
 */
export function decodeNumericObject(
  input: string | (string | null)[] | null | undefined,
  keyValSeparator = '-',
  entrySeparator = '_'
): { [key: string]: number | null | undefined } | null | undefined {
  const decoded: { [key: string]: string } | null | undefined = decodeObject(
    input,
    keyValSeparator,
    entrySeparator
  );

  if (decoded == null) return decoded;

  // convert to numbers
  const decodedNumberObj: { [key: string]: number | null | undefined } = {};
  for (const key of Object.keys(decoded)) {
    decodedNumberObj[key] = decodeNumber(decoded[key]);
  }

  return decodedNumberObj;
}
