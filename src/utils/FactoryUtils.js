/**
 * ============================================================
 * PREVIA Core
 * Factory Utilities
 * ============================================================
 */

import {
  isObject
} from "./ObjectUtils.js";

/**
 * Ensures factory input is a plain object.
 *
 * @param {*} data
 * @param {string} entityName
 * @returns {Object}
 * @throws {TypeError}
 */
function assertPlainObject(data, entityName) {

  if (data === undefined || data === null) {
    return {};
  }

  if (!isObject(data)) {
    throw new TypeError(
      `${entityName} data must be a plain object.`
    );
  }

  return data;

}

export {
  assertPlainObject
};