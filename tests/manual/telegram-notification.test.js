/**
 * ============================================================
 * PREVIA Core
 * Telegram Notification Service Test
 * ============================================================
 */

import assert from "node:assert/strict";
import { TelegramNotificationService } from "../../src/index.js";

const calls = [];

const transport = {
  async sendMessage(payload) {
    calls.push(payload);

    return {
      ok: true,
      result: {
        message_id: 123
      }
    };
  }
};

const service = new TelegramNotificationService(
  "test-bot-token",
  "test-admin-chat-id",
  transport,
  2
);

const order = {
  order_id: "ORD-test-123",
  customer_name: "Иван Иванов",
  phone: "+380501234567",
  email: "ivan@example.com",
  total: 660
};

const items = [
  {
    sku: "SEIKO-001",
    title: "Seiko Vintage",
    price: 330,
    quantity: 1,
    subtotal: 330
  },
  {
    sku: "CITIZEN-002",
    title: "Citizen Vintage",
    price: 165,
    quantity: 2,
    subtotal: 330
  }
];

const result = await service.sendNewOrderNotification(
  order,
  items,
  "VWJ-0000042"
);

assert.deepEqual(result, {
  success: true
});

assert.equal(calls.length, 1);

const payload = calls[0];

assert.equal(
  payload.message_thread_id,
  2
);

assert.equal(
  payload.chat_id,
  "test-admin-chat-id"
);

assert.match(
  payload.text,
  /🛎 НОВЕ ЗАМОВЛЕННЯ/
);

assert.match(
  payload.text,
  /VWJ-0000042/
);

assert.match(
  payload.text,
  /Иван Иванов/
);

assert.match(
  payload.text,
  /\+380501234567/
);

assert.match(
  payload.text,
  /ivan@example.com/
);

assert.match(
  payload.text,
  /Seiko Vintage/
);

assert.match(
  payload.text,
  /Citizen Vintage/
);

assert.match(
  payload.text,
  /660\.00 €/
);

console.log("✓ Telegram notification payload created correctly");
console.log("✓ Telegram admin chat ID passed correctly");
console.log("✓ Public order number included correctly");
console.log("✓ Customer and order details included correctly");
console.log("✓ Telegram forum thread ID included correctly");
console.log("ALL TELEGRAM NOTIFICATION TESTS PASSED");
