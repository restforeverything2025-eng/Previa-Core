/**
 * PREVIA Core - Order Idempotency Service
 * Stable order identity for safe client retries.
 */

import { createHash } from "crypto";

const MIN_KEY_LENGTH = 16;
const MAX_KEY_LENGTH = 128;

function validateIdempotencyKey(key) {
  if (typeof key !== "string") return "idempotency_key is required";
  if (key.length < MIN_KEY_LENGTH || key.length > MAX_KEY_LENGTH) {
    return `idempotency_key length must be between ${MIN_KEY_LENGTH} and ${MAX_KEY_LENGTH} characters`;
  }
  if (!/^[A-Za-z0-9._:-]+$/.test(key)) {
    return "idempotency_key contains unsupported characters";
  }
  return null;
}

function createDeterministicOrderId(provider, providerId, idempotencyKey) {
  const hash = createHash("sha256")
    .update(["previa-order-v1", provider, providerId, idempotencyKey].join("\n"), "utf8")
    .digest("hex");

  const bytes = Buffer.from(hash.slice(0, 32), "hex");
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  const uuid = [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20, 32)].join("-");
  return `ORD-${uuid}`;
}

function ordersEquivalent(left, right) {
  if (!left || !right) return false;

  const scalarFields = [
    "customer_name",
    "phone",
    "email",
    "payment_method",
    "telegram_username",
    "telegram_name",
    "provider",
    "providerId",
    "note"
  ];

  for (const field of scalarFields) {
    if (String(left[field] ?? "") !== String(right[field] ?? "")) return false;
  }

  const leftPreferences = Array.isArray(left.contact_preferences) ? left.contact_preferences : [];
  const rightPreferences = Array.isArray(right.contact_preferences) ? right.contact_preferences : [];
  if (JSON.stringify(leftPreferences) !== JSON.stringify(rightPreferences)) return false;

  const leftItems = Array.isArray(left.items) ? left.items : [];
  const rightItems = Array.isArray(right.items) ? right.items : [];
  if (leftItems.length !== rightItems.length) return false;

  for (let i = 0; i < leftItems.length; i += 1) {
    const leftItem = leftItems[i] || {};
    const rightItem = rightItems[i] || {};

    for (const field of ["sku", "title", "price", "quantity"]) {
      if (String(leftItem[field] ?? "") !== String(rightItem[field] ?? "")) return false;
    }

    // subtotal is derived by Core from price * quantity and may be omitted by the client.
    const leftSubtotal = Number(leftItem.subtotal);
    const rightPrice = Number(rightItem.price);
    const rightQuantity = Number(rightItem.quantity ?? 1);
    const rightSubtotal = Number.isFinite(rightPrice) && Number.isFinite(rightQuantity)
      ? rightPrice * rightQuantity
      : Number(rightItem.subtotal);

    if (leftSubtotal !== rightSubtotal) return false;
  }

  return true;
}

export { validateIdempotencyKey, createDeterministicOrderId, ordersEquivalent };
