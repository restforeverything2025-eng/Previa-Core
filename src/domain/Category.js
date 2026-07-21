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

  name: "",

  slug: "",

  enabled: true,

  sortOrder: 0

});

/**
 * Creates an immutable Category domain object.
 *
 * @param {Object} [data={}] Initial category data.
 * @returns {Object} Immutable Category domain object.
 */
function createCategory(data = {}) {

  data = assertPlainObject(data, "Category");

  return Object.freeze({

    ...CATEGORY_DEFAULTS,

    ...data,

    sortOrder: Number(data.sortOrder ?? CATEGORY_DEFAULTS.sortOrder),

    enabled: Boolean(data.enabled ?? CATEGORY_DEFAULTS.enabled)

  });

}

export {
  createCategory
};