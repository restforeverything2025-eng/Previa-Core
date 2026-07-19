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

  code: "",

  name: "",

  country: "",

  enabled: true

});

/**
 * Creates a Brand domain object.
 *
 * @param {Object} [data={}] Initial brand data.
 * @returns {Object} Brand domain object.
 */
function createBrand(data = {}) {

  data = assertPlainObject(data, "Brand");

  return {

    ...BRAND_DEFAULTS,

    ...data,

    enabled: Boolean(data.enabled)

  };

}

export {
  createBrand
};