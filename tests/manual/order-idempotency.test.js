import assert from "node:assert/strict";

import { OrderService, MemoryOrderRepository } from "../../src/index.js";

console.log("=== PREVIA Core Order Idempotency Test ===");

const repository = new MemoryOrderRepository();
const service = new OrderService(repository);

const baseOrder = {
  provider: "telegram",
  providerId: "telegram-user-100",
  telegram_username: "test_user",
  telegram_name: "Test User",
  customer_name: "Тест PREVIA",
  phone: "+380000000000",
  email: "test@previa.local",
  contact_preferences: ["telegram"],
  payment_method: "nova_poshta_prepayment",
  idempotency_key: "idempotency-test-key-001",
  items: [{ sku: "TEST-001", title: "Test Product", price: 100, quantity: 1 }]
};

const first = await service.saveOrder(baseOrder);
const second = await service.saveOrder(baseOrder);

assert.equal(first.order.order_id, second.order.order_id);
assert.equal(first.idempotent, false);
assert.equal(second.idempotent, true);
assert.equal(repository.orders.size, 1);

await assert.rejects(
  () => service.saveOrder({
    ...baseOrder,
    customer_name: "Другой клиент"
  }),
  error => error.code === "IDEMPOTENCY_CONFLICT" && error.retryable === false
);

const otherCustomer = await service.saveOrder({
  ...baseOrder,
  providerId: "telegram-user-200",
  idempotency_key: "idempotency-test-key-001"
});

assert.notEqual(first.order.order_id, otherCustomer.order.order_id);
assert.equal(repository.orders.size, 2);

await assert.rejects(
  () => service.saveOrder({ ...baseOrder, idempotency_key: "short" }),
  error => error.code === "VALIDATION_ERROR" && error.retryable === false
);

console.log("✓ Repeated request returns the original order");
console.log("✓ Same key with changed payload is rejected");
console.log("✓ Same key is safely scoped to Telegram identity");
console.log("✓ Invalid idempotency key rejected");
console.log("\nALL IDEMPOTENCY TESTS PASSED");
