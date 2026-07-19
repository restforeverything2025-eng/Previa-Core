/**
 * ============================================================
 * PREVIA Core
 * Domain Model: Category
 * ============================================================
 */

import {
  assertPlainObject
} from "../utils/FactoryUtils.js";

const CATEGORY_DEFAULTS = Object.freeze({

  id: "",

  code: "",

  name: "",

  sortOrder: 0,

  enabled: true

});

/**
 * Creates a Category domain object.
 *
 * @param {Object} [data={}] Initial category data.
 * @returns {Object} Category domain object.
 */
function createCategory(data = {}) {

  data = assertPlainObject(data, "Category");

  return {

    ...CATEGORY_DEFAULTS,

    ...data,

    sortOrder: Number(data.sortOrder ?? CATEGORY_DEFAULTS.sortOrder),

    enabled: Boolean(data.enabled)

  };

}

export {
  createCategory
};