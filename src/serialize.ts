/**
 * Encodes a date as a string in YYYY-MM-DD format.
 *
 * @param {Date} date
 * @return {String} the encoded date
 */
export function encodeDate(date: Date | null | undefined): string | undefined {
  if (date == null) {
    return undefined;
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
 * @param  {String} dateString String date form like '2015-10-01'
 * @return {Date} parsed date
 */
export function decodeDate(
  dateString: string | null | undefined
): Date | undefined {
  if (dateString == null || !dateString.length) {
    return undefined;
  }

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
    return undefined;
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
): string | undefined {
  if (bool === undefined) {
    return undefined;
  }

  return bool ? '1' : '0';
}

/**
 * Decodes a boolean from a string. "1" -> true, "0" -> false.
 * Everything else maps to undefined.
 *
 * @param {String} boolStr the encoded boolean string
 * @return {Boolean} the boolean value
 */
export function decodeBoolean(
  boolStr: string | null | undefined
): boolean | undefined {
  if (boolStr === '1') {
    return true;
  } else if (boolStr === '0') {
    return false;
  }

  return undefined;
}

/**
 * Encodes a number as a string.
 *
 * @param {Number} num
 * @return {String} the encoded number
 */
export function encodeNumber(
  num: number | null | undefined
): string | undefined {
  if (num == null) {
    return undefined;
  }

  return String(num);
}

/**
 * Decodes a number from a string via parseFloat. If the number is invalid,
 * it returns undefined.
 *
 * @param {String} numStr the encoded number string
 * @return {Number} the number value
 */
export function decodeNumber(
  numStr: string | null | undefined
): number | undefined {
  if (numStr == null || numStr === '') {
    return undefined;
  }

  const result = +numStr;

  if (isNaN(result)) {
    return undefined;
  }

  return result;
}

/**
 * Encodes a string while safely handling null and undefined values.
 *
 * @param {String} string
 * @return {String} the encoded string
 */
export function encodeString(
  str: string | null | undefined
): string | undefined {
  if (str == null) {
    return undefined;
  }

  return String(str);
}

/**
 * Decodes a string while safely handling null and undefined values.
 *
 * @param {String} str the encoded string
 * @return {String} the string value
 */
export function decodeString(
  str: string | null | undefined
): string | undefined {
  if (str == null) {
    return undefined;
  }

  return String(str);
}

/**
 * Encodes anything as a JSON string.
 *
 * @param {Any} any The thing to be encoded
 * @return {String} The JSON string representation of any
 */
export function encodeJson(any: any | null | undefined): string | undefined {
  if (any == null) {
    return undefined;
  }

  return JSON.stringify(any);
}

/**
 * Decodes a JSON string into javascript
 *
 * @param {String} jsonStr The JSON string representation
 * @return {Any} The javascript representation
 */
export function decodeJson(
  jsonStr: string | null | undefined
): any | undefined {
  if (!jsonStr) {
    return undefined;
  }

  let result;
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
 * @return {String} The JSON string representation of array
 */
export function encodeArray(
  array: (string | undefined)[] | null | undefined,
  entrySeparator = '_'
): string | undefined {
  if (!array) {
    return undefined;
  }

  return array.join(entrySeparator);
}

/**
 * Decodes a JSON string into javascript array
 *
 * @param {String} jsonStr The JSON string representation
 * @return {Array} The javascript representation
 */
export function decodeArray(
  arrayStr: string | null | undefined,
  entrySeparator = '_'
): (string | undefined)[] | undefined {
  if (!arrayStr) {
    return undefined;
  }

  return arrayStr
    .split(entrySeparator)
    .map(item => (item === '' ? undefined : item));
}

/**
 * Encodes a numeric array as a JSON string. (alias of encodeArray)
 *
 * @param {Array} array The array to be encoded
 * @return {String} The JSON string representation of array
 */
export const encodeNumericArray = encodeArray as (
  array: (number | undefined)[] | null | undefined,
  entrySeparator?: string
) => string | undefined;

/**
 * Decodes a JSON string into javascript array where all entries are numbers
 *
 * @param {String} jsonStr The JSON string representation
 * @return {Array} The javascript representation
 */
export function decodeNumericArray(
  arrayStr: string | null | undefined,
  entrySeparator = '_'
): (number | undefined)[] | undefined {
  const decoded = decodeArray(arrayStr, entrySeparator);

  if (!decoded) {
    return undefined;
  }

  return decoded.map(d => (d == null ? undefined : +d));
}

/**
 * Encode simple objects as readable strings. Currently works only for simple,
 * flat objects where values are numbers, booleans or strings.
 *
 * For example { foo: bar, boo: baz } -> "foo-bar_boo-baz"
 *
 * @param {Object} object The object to encode
 * @param {String} keyValSeparator="-" The separator between keys and values
 * @param {String} entrySeparator="_" The separator between entries
 * @return {String} The encoded object
 */
export function encodeObject(
  obj: { [key: string]: string | number | undefined } | null | undefined,
  keyValSeparator = '-',
  entrySeparator = '_'
): string | undefined {
  if (!obj || !Object.keys(obj).length) {
    return undefined;
  }

  return Object.keys(obj)
    .map(key => `${key}${keyValSeparator}${obj[key]}`)
    .join(entrySeparator);
}

/**
 * Decodes a simple object to javascript. Currently works only for simple,
 * flat objects where values are numbers, booleans or strings.
 *
 * For example "foo-bar_boo-baz" -> { foo: bar, boo: baz }
 *
 * @param {String} objStr The object string to decode
 * @param {String} keyValSeparator="-" The separator between keys and values
 * @param {String} entrySeparator="_" The separator between entries
 * @return {Object} The javascript object
 */
export function decodeObject(
  objStr: string | null | undefined,
  keyValSeparator = '-',
  entrySeparator = '_'
): { [key: string]: string | undefined } | undefined {
  if (!objStr || !objStr.length) {
    return undefined;
  }
  const obj: { [key: string]: string | undefined } = {};

  objStr.split(entrySeparator).forEach(entryStr => {
    const [key, value] = entryStr.split(keyValSeparator);
    obj[key] = value === '' ? undefined : value;
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
export const encodeNumericObject = encodeObject;

/**
 * Decodes a simple object to javascript where all values are numbers.
 * Currently works only for simple, flat objects.
 *
 * For example "foo-123_boo-521" -> { foo: 123, boo: 521 }
 *
 * @param {String} objStr The object string to decode
 * @param {String} keyValSeparator="-" The separator between keys and values
 * @param {String} entrySeparator="_" The separator between entries
 * @return {Object} The javascript object
 */
export function decodeNumericObject(
  objStr: string | null | undefined,
  keyValSeparator = '-',
  entrySeparator = '_'
): { [key: string]: number | undefined } | undefined {
  const decoded:
    | { [key: string]: number | string | undefined }
    | undefined = decodeObject(objStr, keyValSeparator, entrySeparator);

  if (!decoded) {
    return undefined;
  }

  // convert to numbers
  Object.keys(decoded).forEach(key => {
    if (decoded[key] !== undefined) {
      decoded[key] = decodeNumber(decoded[key] as string);
    }
  });

  return decoded as { [key: string]: number | undefined };
}
