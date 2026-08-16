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

  // Provider validation (Telegram only for v1)
  if (!order.provider) {
    errors.push("provider is required");
  } else if (order.provider !== "telegram") {
    errors.push("provider must be 'telegram' (only option for v1)");
  }

  if (!order.providerId) {
    errors.push("providerId is required");
  }

  if (!order.telegram_name) {
    errors.push("telegram_name is required");
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

  if (!order.payment_method) {
    errors.push("payment_method is required");
  }

  // Reject if App tries to set order_id
  // order_id is generated server-side only
  if (order.order_id !== undefined && order.order_id !== null) {
    errors.push("order_id must not be provided by client (generated server-side)");
  }

  // Items validation
  if (!Array.isArray(order.items)) {
    errors.push("items must be an array");
  } else {

    if (order.items.length === 0) {
      errors.push("items must contain at least 1 element");
    }

    if (order.items.length > 3) {
      errors.push("items must contain at most 3 elements");
    }

    // Track SKUs to detect duplicates
    const skus = new Set();

    order.items.forEach((item, index) => {

      if (!item.sku) {
        errors.push(`items[${index}]: sku is required`);
      } else if (skus.has(item.sku)) {
        errors.push(`items[${index}]: duplicate sku '${item.sku}' not allowed`);
      } else {
        skus.add(item.sku);
      }

      if (!item.title) {
        errors.push(`items[${index}]: title is required`);
      }

      if (typeof item.price !== "number" || item.price <= 0 || !isFinite(item.price)) {
        errors.push(`items[${index}]: price must be a positive finite number`);
      }

      if (item.quantity !== 1) {
        errors.push(`items[${index}]: quantity must be exactly 1`);
      }

    });

  }

  // Reject payment_type and order_status if provided
  // These are set by Core server-side
  if (order.payment_type !== undefined && order.payment_type !== null) {
    // payment_type will be enforced by OrderService, not validated here
    // but we note it should not be user-provided
  }

  if (order.order_status !== undefined && order.order_status !== null) {
    // order_status will be enforced by OrderService, not validated here
  }

  return errors;
}

export {
  validateOrder
};