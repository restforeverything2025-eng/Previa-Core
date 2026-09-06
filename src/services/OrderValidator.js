/**
 * ============================================================
 * PREVIA Core
 * Order Validator
 * ============================================================
 *
 * Validates external Order input.
 * Server-owned identity and lifecycle fields are rejected here.
 * ============================================================
 */

function validateOrder(order = {}) {
  const errors = [];

  // Telegram identity is established by Core after initData verification.
  // The public order API must not accept a browser-supplied provider identity.
  if (order.provider !== "telegram") {
    errors.push("provider must be 'telegram'");
  }

  if (!order.providerId) {
    errors.push("providerId is required for telegram");
  }

  if (!order.telegram_name) {
    errors.push("telegram_name is required for telegram");
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

  if (order.contact_preferences !== undefined) {
    if (!Array.isArray(order.contact_preferences)) {
      errors.push("contact_preferences must be an array");
    } else {
      const allowedContactPreferences = [
        "telegram",
        "viber",
        "call"
      ];

      const invalidPreferences = order.contact_preferences.filter(
        preference => !allowedContactPreferences.includes(preference)
      );

      if (invalidPreferences.length > 0) {
        errors.push("contact_preferences contains invalid value(s)");
      }
    }
  }

  if (!order.payment_method) {
    errors.push("payment_method is required");
  }

  // Server-owned fields must never be accepted from the external client.
  const serverOwnedFields = [
    "order_id",
    "created_at",
    "source",
    "payment_type",
    "payment_status",
    "order_status",
    "subtotal",
    "total",
    "expires_at",
    "paid_at",
    "document_url"
  ];

  for (const field of serverOwnedFields) {
    if (order[field] !== undefined && order[field] !== null) {
      errors.push(`${field} must not be provided by client`);
    }
  }

  if (!Array.isArray(order.items)) {
    errors.push("items must be an array");
  } else {
    if (order.items.length === 0) {
      errors.push("items must contain at least 1 element");
    }

    if (order.items.length > 3) {
      errors.push("items must contain at most 3 elements");
    }

    const skus = new Set();

    order.items.forEach((item, index) => {
      if (!item || typeof item !== "object") {
        errors.push(`items[${index}] must be an object`);
        return;
      }

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

      if (typeof item.price !== "number" || item.price <= 0 || !Number.isFinite(item.price)) {
        errors.push(`items[${index}]: price must be a positive finite number`);
      }

      if (item.quantity !== 1) {
        errors.push(`items[${index}]: quantity must be exactly 1`);
      }

      const itemServerOwnedFields = [
        "order_id",
        "subtotal"
      ];

      for (const field of itemServerOwnedFields) {
        if (item[field] !== undefined && item[field] !== null) {
          errors.push(`items[${index}]: ${field} must not be provided by client`);
        }
      }
    });
  }

  return errors;
}

export {
  validateOrder
};
