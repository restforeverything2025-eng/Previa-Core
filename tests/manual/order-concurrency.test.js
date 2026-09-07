import assert from "node:assert/strict";

import { OrderService, MemoryOrderRepository } from "../../src/index.js";

console.log("=== PREVIA Core Concurrent Order Idempotency Test ===");

class RaceRepository extends MemoryOrderRepository {
  constructor() {
    super();
    this.findCount = 0;
    this.saveCount = 0;
  }

  async findById(orderId) {
    this.findCount += 1;
    return super.findById(orderId);
  }

  async save(order, items) {
    this.saveCount += 1;
    if (this.orders.has(order.order_id)) {
      const error = new Error("Duplicate order_id");
      error.code = "DUPLICATE_ORDER";
      throw error;
    }
    await new Promise(resolve => setTimeout(resolve, 10));
    if (this.orders.has(order.order_id)) {
      const error = new Error("Duplicate order_id");
      error.code = "DUPLICATE_ORDER";
      throw error;
    }
    return super.save(order, items);
  }
}

const repository = new RaceRepository();
const service = new OrderService(repository);

const baseOrder = {
  provider: "telegram",
  providerId: "telegram-user-race-001",
  telegram_username: "race_user",
  telegram_name: "Race User",
  customer_name: "Concurrent Customer",
  phone: "+380000000001",
  email: "race@previa.local",
  contact_preferences: ["telegram"],
  payment_method: "nova_poshta_prepayment",
  idempotency_key: "concurrent-race-test-001",
  items: [{ sku: "TEST-001", title: "Test Product", price: 100, quantity: 1 }]
};

const [first, second] = await Promise.all([
  service.saveOrder(baseOrder),
  service.saveOrder(baseOrder)
]);

assert.equal(first.order.order_id, second.order.order_id);
assert.deepEqual(
  [first.idempotent, second.idempotent].sort(),
  [false, true]
);
assert.equal(repository.orders.size, 1);
assert.equal(repository.saveCount, 2);
assert.ok(repository.findCount >= 3);

console.log("✓ Concurrent requests produce one persisted order");
console.log("✓ Losing request recovers the canonical order as idempotent");
console.log("✓ Repository contains exactly one order");
console.log("\nALL CONCURRENT IDEMPOTENCY TESTS PASSED");
