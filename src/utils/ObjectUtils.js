/**
 * ============================================================
 * PREVIA Core
 * Object Utilities
 * ============================================================
 */

/**
 * Returns true if value is a plain object.
 *
 * @param {*} value
 * @returns {boolean}
 */
function isObject(value) {

  return value !== null &&
         typeof value === "object" &&
         !Array.isArray(value);

}

/**
 * Returns true if object has no own properties.
 *
 * @param {Object} obj
 * @returns {boolean}
 */
function isEmptyObject(obj) {

  return isObject(obj) &&
         Object.keys(obj).length === 0;

}

/**
 * Creates a shallow clone.
 *
 * @param {Object} obj
 * @returns {Object}
 */
function cloneObject(obj) {

  return {

    ...obj

  };

}