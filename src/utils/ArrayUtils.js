/**
 * ============================================================
 * PREVIA Core
 * Array Utilities
 * ============================================================
 */

/**
 * Returns true if value is an array.
 *
 * @param {*} value
 * @returns {boolean}
 */
function isArray(value) {

  return Array.isArray(value);

}

/**
 * Returns true if array is empty.
 *
 * @param {*} value
 * @returns {boolean}
 */
function isEmptyArray(value) {

  return isArray(value) &&
         value.length === 0;

}

/**
 * Returns a shallow copy of an array.
 *
 * @param {Array} array
 * @returns {Array}
 */
function cloneArray(array) {

  return isArray(array)
    ? [...array]
    : [];

}

/**
 * Returns unique array values.
 *
 * @param {Array} array
 * @returns {Array}
 */
function unique(array) {

  return isArray(array)
    ? [...new Set(array)]
    : [];

}