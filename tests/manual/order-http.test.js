import assert from "node:assert/strict";

import { OrderHttpHandler } from "../../src/index.js";

console.log("=== PREVIA Core Order HTTP Test ===");

let endpointInput = null;

const endpoint = {
  async create(orderData) {
    endpointInput = orderData;
    return {
      success: true,
      code: "ORDER_CREATED",
      order_id: "ORD-HTTP-TEST"
    };
  }
};

const identityVerifier = {
  verify(initData) {
    assert.equal(initData, "SIGNED_TELEGRAM_INIT_DATA");

    return {
      provider: "telegram",
      providerId: "987654321",
      telegram_username: "trusted_user",
      telegram_name: "Trusted User"
    };
  }
};

const handler = new OrderHttpHandler(endpoint, identityVerifier);

const result = await handler.create({
  method: "POST",
  body: {
    telegram_init_data: "SIGNED_TELEGRAM_INIT_DATA",
    order: {
      provider: "web",
      providerId: "attacker-id",
      telegram_name: "Fake Name",
      customer_name: "Тест PREVIA",
      phone: "+380000000000",
      email: "test@previa.local",
      contact_preferences: ["telegram"],
      payment_method: "nova_poshta_prepayment"
    },
    items: [
      {
        sku: "HTTP-TEST",
        title: "HTTP Test",
        price: 1,
        quantity: 1
      }
    ]
  }
});

assert.equal(result.status, 200);
assert.equal(result.body.success, true);
assert.ok(endpointInput);
assert.equal(endpointInput.provider, "telegram");
assert.equal(endpointInput.providerId, "987654321");
assert.equal(endpointInput.telegram_username, "trusted_user");
assert.equal(endpointInput.telegram_name, "Trusted User");
assert.equal(endpointInput.items[0].sku, "HTTP-TEST");

const missingAuth = await handler.create({
  method: "POST",
  body: {
    order: {
      customer_name: "Тест",
      phone: "+380000000000",
      email: "test@previa.local",
      contact_preferences: ["telegram"],
      payment_method: "nova_poshta_prepayment"
    },
    items: []
  }
});

assert.equal(missingAuth.status, 401);
assert.equal(missingAuth.body.code, "AUTHENTICATION_ERROR");

const wrongMethod = await handler.create({
  method: "GET",
  body: {}
});

assert.equal(wrongMethod.status, 405);
assert.equal(wrongMethod.body.code, "METHOD_NOT_ALLOWED");

console.log("✓ Telegram identity overrides client-supplied identity");
console.log("✓ Missing Telegram auth rejected");
console.log("✓ Non-POST request rejected");
console.log("ALL HTTP TESTS PASSED");
