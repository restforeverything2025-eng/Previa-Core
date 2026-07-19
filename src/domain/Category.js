/**
 * ============================================================
 * PREVIA Core
 * Domain Model: Category
 * ============================================================
 */

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
 * @param {Object} data
 * @returns {Object}
 */
function createCategory(data = {}) {

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