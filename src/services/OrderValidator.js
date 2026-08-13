/**
 * ============================================================
 * PREVIA Core
 * Order Validator
 * ============================================================
 *
 * Validates Order input.
 *
 * Business logic does not belong here.
 * This module only checks the structure and required data.
 * ============================================================
 */

function validateOrder(order = {}) {

  const errors = [];

  if (!order.provider) {
    errors.push("provider is required");
  }

  if (!order.providerId) {
    errors.push("providerId is required");
  }

  if (!order.customer_name) {
    errors.push("customer_name is required");
  }

  if (!order.phone) {
    errors.push("phone is required");
  }

  if (!order.email) {
    errors.push("email is required");
  }

  if (!order.payment_type) {
    errors.push("payment_type is required");
  }

  if (!order.payment_method) {
    errors.push("payment_method is required");
  }

  return errors;
}

export {
  validateOrder
};