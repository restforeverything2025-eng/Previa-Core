/**
 * ============================================================
 * PREVIA Core
 * Domain Model: Brand
 * ============================================================
 */

import {
  assertPlainObject
} from "../utils/FactoryUtils.js";

const BRAND_DEFAULTS = Object.freeze({

  id: "",

  name: "",

  country: "",

  enabled: true

});

/**
 * Creates an immutable Brand domain object.
 *
 * @param {Object} [data={}] Initial brand data.
 * @returns {Object} Immutable Brand domain object.
 */
function createBrand(data = {}) {

  data = assertPlainObject(data, "Brand");

  return Object.freeze({

  ...BRAND_DEFAULTS,

  ...data,

  enabled: Boolean(data.enabled ?? BRAND_DEFAULTS.enabled)

});

}

export {
  createBrand
};