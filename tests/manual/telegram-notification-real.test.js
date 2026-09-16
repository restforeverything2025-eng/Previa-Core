/**
 * ============================================================
 * PREVIA Core
 * Real Telegram Notification Test
 * ============================================================
 *
 * Sends one real test notification to the configured
 * PREVIA_ADMIN_CHAT_ID.
 *
 * IMPORTANT:
 * - Does NOT create an order
 * - Does NOT call CMS
 * - Does NOT touch Google Sheets / Drive
 * - Uses real Telegram Bot API
 * - Must NOT be included in test:orders
 * ============================================================
 */

import assert from "node:assert/strict";
import {
  TelegramNotificationService
} from "../../src/index.js";

const botToken =
  process.env.PREVIA_TELEGRAM_BOT_TOKEN;

const adminChatId =
  process.env.PREVIA_ADMIN_CHAT_ID;

assert.ok(
  botToken,
  "PREVIA_TELEGRAM_BOT_TOKEN is missing"
);

assert.ok(
  adminChatId,
  "PREVIA_ADMIN_CHAT_ID is missing"
);

const service =
  new TelegramNotificationService(
    botToken,
    adminChatId
  );

const result =
  await service.sendNewOrderNotification(
    {
      order_id: "ORD-TELEGRAM-TEST",
      customer_name:
        "PREVIA TEST — НЕ РЕАЛЬНЕ ЗАМОВЛЕННЯ",
      phone: "+380000000000",
      total: 1
    },
    [
      {
        sku: "TEST-TELEGRAM",
        title: "Telegram Test Item",
        price: 1,
        quantity: 1,
        subtotal: 1
      }
    ],
    "VWJ-TEST-0000001"
  );

assert.deepEqual(result, {
  success: true
});

console.log(
  "✓ Real Telegram notification sent successfully"
);

console.log(
  "✓ No CMS order was created"
);

console.log(
  "✓ PREVIA Telegram integration test passed"
);
