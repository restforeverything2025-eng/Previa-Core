/**
 * ============================================================
 * PREVIA Core
 * Order → Telegram Integration Test
 * ============================================================
 *
 * Verifies:
 * - Telegram is called after successful repository.save()
 * - Public order number is passed to Telegram
 * - Idempotent retry does NOT send Telegram again
 * - Telegram failure does NOT fail order creation
 *
 * IMPORTANT:
 * - No real Telegram API
 * - No CMS
 * - No Google Sheets / Drive
 * - No real order
 * ============================================================
 */

import assert from "node:assert/strict";

import {
  OrderService
} from "../../src/index.js";

const baseOrder = {
  provider: "telegram",
  providerId: "telegram-user-test",
  telegram_username: "previa_test",
  telegram_name: "PREVIA Test",
  customer_name: "PREVIA Integration Test",
  phone: "+380000000000",
  email: "test@previa.local",
  contact_preferences: ["telegram"],
  payment_method: "nova_poshta_prepayment",
  idempotency_key: "telegram-integration-test-001",
  items: [
    {
      sku: "TEST-TELEGRAM-001",
      title: "Telegram Integration Test",
      price: 100,
      quantity: 1
    }
  ]
};

// ============================================================
// Mock repository
// Simulates the production CMS response.
// ============================================================

class MockOrderRepository {
  constructor() {
    this.orders = new Map();
  }

  async save(order, items) {
    this.orders.set(order.order_id, {
      order,
      items
    });

    return {
      order,
      items,
      public_order_number: "VWJ-0000042"
    };
  }

  async findById(orderId) {
    return this.orders.get(orderId) || null;
  }
}

// ============================================================
// TEST 1
// New order → Telegram called once
// Public order number is passed correctly
// ============================================================

const repository = new MockOrderRepository();

const telegramCalls = [];

const telegramService = {
  async sendNewOrderNotification(
    order,
    items,
    publicOrderNumber
  ) {
    telegramCalls.push({
      order,
      items,
      publicOrderNumber
    });

    return {
      success: true
    };
  }
};

const service = new OrderService(
  repository,
  null,
  telegramService
);

const first = await service.saveOrder(baseOrder);

assert.equal(
  first.idempotent,
  false
);

assert.equal(
  first.public_order_number,
  "VWJ-0000042"
);

assert.equal(
  telegramCalls.length,
  1
);

assert.equal(
  telegramCalls[0].order.order_id,
  first.order.order_id
);

assert.equal(
  telegramCalls[0].publicOrderNumber,
  "VWJ-0000042"
);

assert.equal(
  telegramCalls[0].items.length,
  1
);

console.log(
  "✓ New order triggers Telegram notification exactly once"
);

console.log(
  "✓ CMS public order number is passed to Telegram correctly"
);

// ============================================================
// TEST 2
// Idempotent retry → Telegram NOT called again
// ============================================================

const second = await service.saveOrder(baseOrder);

assert.equal(
  second.idempotent,
  true
);

assert.equal(
  second.order.order_id,
  first.order.order_id
);

assert.equal(
  telegramCalls.length,
  1
);

console.log(
  "✓ Idempotent retry does not send Telegram again"
);

// ============================================================
// TEST 3
// Telegram failure → order still succeeds
// ============================================================

const failingRepository =
  new MockOrderRepository();

const failingTelegramService = {
  async sendNewOrderNotification() {
    throw new Error(
      "Simulated Telegram failure"
    );
  }
};

const failingService = new OrderService(
  failingRepository,
  null,
  failingTelegramService
);

const resultAfterTelegramFailure =
  await failingService.saveOrder({
    ...baseOrder,
    providerId: "telegram-user-failure-test",
    idempotency_key:
      "telegram-integration-test-002"
  });

assert.equal(
  resultAfterTelegramFailure.idempotent,
  false
);

assert.equal(
  resultAfterTelegramFailure.public_order_number,
  "VWJ-0000042"
);

assert.ok(
  resultAfterTelegramFailure.order
);

assert.ok(
  failingRepository.orders.has(
    resultAfterTelegramFailure.order.order_id
  )
);

console.log(
  "✓ Telegram failure does not fail order creation"
);

console.log(
  "\nALL ORDER → TELEGRAM INTEGRATION TESTS PASSED"
);
