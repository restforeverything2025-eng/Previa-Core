/**
 * ============================================================
 * PREVIA Core
 * Domain Model: Brand
 * ============================================================
 */

const BRAND_DEFAULTS = Object.freeze({

  id: "",

  code: "",

  name: "",

  country: "",

  enabled: true

});

/**
 * Creates a Brand domain object.
 *
 * @param {Object} data
 * @returns {Object}
 */
function createBrand(data = {}) {

  return {

    ...BRAND_DEFAULTS,

    ...data,

    enabled: Boolean(data.enabled)

  };

}

export {
  createBrand
};