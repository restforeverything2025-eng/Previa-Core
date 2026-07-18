/**
 * ============================================================
 * PREVIA Core
 * Product Validator
 * ============================================================
 */

/**
 * Validates a product.
 *
 * @param {Object} product
 * @returns {Array<string>}
 */
function validateProduct(product) {

  const errors = [];

  if (!isObject(product)) {

    errors.push({
      field: null,
      code: ERROR_CODES.PRODUCT_INVALID
    });

    return errors;

  }

  if (isEmptyString(product.sku)) {

    errors.push({
      field: "sku",
      code: ERROR_CODES.SKU_REQUIRED
    });

  }

  if (isEmptyString(product.name)) {

    errors.push({
      field: "name",
      code: ERROR_CODES.NAME_REQUIRED
    });

  }

  if (product.price < 0) {

    errors.push({
      field: "price",
      code: ERROR_CODES.PRICE_NEGATIVE
    });

  }

  return errors;

}