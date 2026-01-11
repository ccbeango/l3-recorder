function isString(val: unknown): val is string {
  return typeof val === 'string';
}

function isObject(val: unknown): val is Record<any, any> {
  return val !== null && typeof val === 'object';
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function isFunction(val: unknown): val is Function {
  return typeof val === 'function';
}

/**
 * 检查传入的值是否为undefined。
 *
 * @param {unknown} value 要检查的值。
 * @returns {boolean} 如果值是undefined，返回true，否则返回false。
 */
function isUndefined(value?: unknown): value is undefined {
  return value === undefined;
}

/**
 * 检查传入的值是否为数字
 * @param value
 */
function isNumber(value?: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * 检查传入的值是否为boolean
 * @param value
 * @returns 如果值是布尔值，返回true，否则返回false。
 */
function isBoolean(value?: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * 检查传入的值是否为空。
 *
 * 以下情况将被认为是空：
 * - 值为null。
 * - 值为undefined。
 * - 值为一个空字符串。
 * - 值为一个长度为0的数组。
 * - 值为一个没有元素的Map或Set。
 * - 值为一个没有属性的对象。
 *
 * @param {T} value 要检查的值。
 * @returns {boolean} 如果值为空，返回true，否则返回false。
 */
function isEmpty<T = unknown>(value?: T): value is T {
  if (value === null || value === undefined) {
    return true;
  }

  if (Array.isArray(value) || isString(value)) {
    return value.length === 0;
  }

  if (value instanceof Map || value instanceof Set) {
    return value.size === 0;
  }

  if (isObject(value)) {
    return Object.keys(value).length === 0;
  }

  return false;
}

/**
 * 检查传入的字符串是否为有效的HTTP或HTTPS URL。
 *
 * @param {string} url 要检查的字符串。
 * @return {boolean} 如果字符串是有效的HTTP或HTTPS URL，返回true，否则返回false。
 */
function isHttpUrl(url?: string): boolean {
  if (!url) {
    return false;
  }

  const httpRegex = /^https?:\/\/.*$/;
  return httpRegex.test(url);
}

/**
 * 检查当前运行环境是否为Mac OS。
 *
 * 这个函数通过检查navigator.userAgent字符串来判断当前运行环境。
 * 如果userAgent字符串中包含"macintosh"或"mac os x"（不区分大小写），则认为当前环境是Mac OS。
 *
 * @returns {boolean} 如果当前环境是Mac OS，返回true，否则返回false。
 */
function isMacOs(): boolean {
  const macRegex = /macintosh|mac os x/i;
  return macRegex.test(navigator.userAgent);
}

/**
 * 检查当前运行环境是否为Windows OS。
 *
 * 这个函数通过检查navigator.userAgent字符串来判断当前运行环境。
 * 如果userAgent字符串中包含"windows"或"win32"（不区分大小写），则认为当前环境是Windows OS。
 *
 * @returns {boolean} 如果当前环境是Windows OS，返回true，否则返回false。
 */
function isWindowsOs(): boolean {
  const windowsRegex = /windows|win32/i;
  return windowsRegex.test(navigator.userAgent);
}

/**
 * 返回提供的列表中第一个既不是 `null` 也不是 `undefined` 的值。
 *
 * 此函数会遍历输入的值，并返回第一个严格不等于 `null` 或 `undefined` 的值。
 * 如果所有值都是 `null` 或 `undefined`，则返回 `undefined`。
 *
 * @template T - 输入值的类型。
 * @param {...(T | null | undefined)} values - 需要评估的值列表。
 * @returns {T | undefined} - 第一个不是 `null` 或 `undefined` 的值，如果未找到则返回 `undefined`。
 *
 * @example
 * // 返回 42，因为它是第一个非 null 且非 undefined 的值。
 * getFirstNonNullOrUndefined(undefined, null, 42, 'hello'); // 42
 *
 * @example
 * // 返回 'hello'，因为它是第一个非 null 且非 undefined 的值。
 * getFirstNonNullOrUndefined(null, undefined, 'hello', 123); // 'hello'
 *
 * @example
 * // 返回 undefined，因为所有值都是 null 或 undefined。
 * getFirstNonNullOrUndefined(undefined, null); // undefined
 */
function getFirstNonNullOrUndefined<T>(
  ...values: (null | T | undefined)[]
): T | undefined {
  for (const value of values) {
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return undefined;
}

export {
  getFirstNonNullOrUndefined,
  isBoolean,
  isEmpty,
  isFunction,
  isHttpUrl,
  isMacOs,
  isNumber,
  isObject,
  isString,
  isUndefined,
  isWindowsOs,
};
