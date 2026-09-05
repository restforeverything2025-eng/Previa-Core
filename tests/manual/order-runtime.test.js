import assert from "node:assert/strict";

import {
  OrderService,
  CmsOrderRepository
} from "../../src/index.js";


console.log("=== PREVIA Core Order Runtime Test ===");


let receivedEnvelope = null;


const fakeTransport = {

  async post(envelope) {

    receivedEnvelope = envelope;

    return {
      success: true,

      order: {
        order_id: "ORD-TEST-001",
        created_at: "2026-09-05T00:00:00.000Z"
      },

      items: [
        {
          order_id: "ORD-TEST-001",
          sku: "TEST-001",
          title: "Test Product",
          price: 100,
          quantity: 1,
          subtotal: 100
        }
      ]
    };

  }

};


const repository =
  new CmsOrderRepository(
    "http://fake-cms.local",
    "test-secret",
    fakeTransport
  );


const service =
  new OrderService(repository);


const result =
  await service.saveOrder({

    provider: "telegram",

    providerId: "test-user-001",

    telegram_name: "previa_test",

    customer_name: "Тест PREVIA",

    phone: "+380000000000",

    email: "test@previa.local",

    contact_preferences: [
      "telegram"
    ],

    payment_method:
      "nova_poshta_prepayment",

    items: [
      {
        sku: "TEST-001",
        title: "Test Product",
        price: 100,
        quantity: 1
      }
    ]

  });


assert.ok(result);
assert.ok(result.order);
assert.ok(result.items);


assert.match(
  result.order.order_id,
  /^ORD-/
);


assert.equal(
  result.items.length,
  1
);


assert.equal(
  result.items[0].sku,
  "TEST-001"
);


assert.equal(
  result.items[0].quantity,
  1
);


assert.equal(
  result.items[0].subtotal,
  100
);


assert.ok(receivedEnvelope);


assert.equal(
  receivedEnvelope.action,
  "order.create"
);


assert.equal(
  receivedEnvelope.auth.version,
  "v1"
);


assert.equal(
  receivedEnvelope.auth.key_id,
  "core-v1"
);


const cmsPayload =
  JSON.parse(receivedEnvelope.payload);


assert.ok(cmsPayload.order);
assert.ok(cmsPayload.items);


assert.equal(
  cmsPayload.order.provider,
  "telegram"
);


assert.equal(
  cmsPayload.order.contact_preferences[0],
  "telegram"
);


assert.equal(
  cmsPayload.items[0].sku,
  "TEST-001"
);


console.log("");
console.log("✓ Order created");
console.log("✓ OrderItem created");
console.log("✓ Telegram provider preserved");
console.log("✓ Contact preferences preserved");
console.log("✓ CMS payload created");
console.log("✓ HMAC envelope created");
console.log("");
console.log("ALL RUNTIME TESTS PASSED");
