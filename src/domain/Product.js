/**
 * Creates a Product domain object.
 *
 * @param {Object} [data={}] Initial product data.
 * @returns {Object} Product domain object.
 */

import {
  assertPlainObject
} from "../utils/FactoryUtils.js";

const PRODUCT_DEFAULTS = Object.freeze({

  id: "",

  sku: "",

  category: "",

  brand: "",

  name: "",

  description: "",

  currency: "UAH",

  price: 0,

  status: "draft",

  featuredHome: false,

  sortOrder: 0,

  dateAdded: "",

  media: [],

  notes: ""

});

/**
 * Creates a Product domain object.
 *
 * @param {Object} data
 * @returns {Object}
 */
function createProduct(data = {}) {

  data = assertPlainObject(data, "Product");

  return {

    ...PRODUCT_DEFAULTS,

    ...data,

    price: Number(data.price ?? PRODUCT_DEFAULTS.price),

    sortOrder: Number(data.sortOrder ?? PRODUCT_DEFAULTS.sortOrder),

    featuredHome: Boolean(data.featuredHome)

  };

}

export {
  createProduct
};