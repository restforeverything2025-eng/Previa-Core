/**
 * ============================================================
 * PREVIA Core
 * String Utilities
 * ============================================================
 */

/**
 * Returns true if value is a string.
 *
 * @param {*} value
 * @returns {boolean}
 */
function isString(value) {

  return typeof value === "string";

}

/**
 * Returns trimmed string.
 *
 * @param {*} value
 * @returns {string}
 */
function trim(value) {

  return isString(value)
    ? value.trim()
    : "";

}

/**
 * Returns true if string is empty.
 *
 * @param {*} value
 * @returns {boolean}
 */
function isEmptyString(value) {

  return trim(value) === "";

}

/**
 * Converts string to uppercase.
 *
 * @param {*} value
 * @returns {string}
 */
function toUpper(value) {

  return trim(value).toUpperCase();

}

/**
 * Converts string to lowercase.
 *
 * @param {*} value
 * @returns {string}
 */
function toLower(value) {

  return trim(value).toLowerCase();

}

export {
  isString,
  trim,
  isEmptyString,
  toUpper,
  toLower
};