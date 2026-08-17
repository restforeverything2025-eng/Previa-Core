/**
 * ============================================================
 * PREVIA Core
 * Order Endpoint Test
 * ============================================================
 *
 * Local unit-style test.
 *
 * No HTTP.
 * No CMS.
 * No network.
 *
 * ============================================================
 */

import { OrderEndpoint } from "../../src/api/OrderEndpoint.js";


/**
 * ============================================================
 * Fake OrderService
 * ============================================================
 */

class FakeOrderService {

  constructor() {
    this.calls = [];
    this.response = null;
    this.error = null;
  }


  async saveOrder(data) {

    this.calls.push(data);

    if (this.error) {
      throw this.error;
    }

    return this.response;
  }

}


/**
 * ============================================================
 * TEST 1 — Successful order creation
 * ============================================================
 */

console.log("=== TEST 1: Successful Order Creation ===");

const fakeService1 =
  new FakeOrderService();

fakeService1.response = {
  order: {
    order_id: "ORD-TEST-001",
    created_at: "2026-08-17T12:00:00.000Z"
  },
  items: []
};


const endpoint1 =
  new OrderEndpoint(fakeService1);


const result1 =
  await endpoint1.create({
    provider: "telegram",
    providerId: "123456789",
    telegram_name: "Test User"
  });


console.log(
  "Success:",
  result1.success
);

console.log(
  "Order ID:",
  result1.order_id
);

console.log(
  "Created at:",
  result1.created_at
);


console.assert(
  result1.success === true,
  "Success response should be true"
);

console.assert(
  result1.order_id === "ORD-TEST-001",
  "Order ID should be returned"
);

console.assert(
  result1.created_at === "2026-08-17T12:00:00.000Z",
  "created_at should be returned"
);

console.assert(
  fakeService1.calls.length === 1,
  "OrderService.saveOrder should be called once"
);

console.log(
  "✓ Successful order creation works\n"
);


/**
 * ============================================================
 * TEST 2 — Validation error mapping
 * ============================================================
 */

console.log("=== TEST 2: Validation Error Mapping ===");

const fakeService2 =
  new FakeOrderService();


const validationError =
  new Error(
    "Order validation failed: email is invalid"
  );


fakeService2.error =
  validationError;


const endpoint2 =
  new OrderEndpoint(fakeService2);


const result2 =
  await endpoint2.create({
    provider: "telegram"
  });


console.log(
  "Success:",
  result2.success
);

console.log(
  "Code:",
  result2.code
);

console.log(
  "Retryable:",
  result2.retryable
);

console.log(
  "Message:",
  result2.message
);


console.assert(
  result2.success === false,
  "Validation should fail"
);

console.assert(
  result2.code === "VALIDATION_ERROR",
  "Validation error should map to VALIDATION_ERROR"
);

console.assert(
  result2.retryable === false,
  "Validation error must not be retryable"
);

console.assert(
  result2.message === validationError.message,
  "Original validation message should be preserved"
);

console.log(
  "✓ Validation error mapping works\n"
);


/**
 * ============================================================
 * TEST 3 — CMS duplicate error mapping
 * ============================================================
 */

console.log("=== TEST 3: CMS Duplicate Error Mapping ===");

const fakeService3 =
  new FakeOrderService();


const duplicateError =
  new Error(
    "Order with this ID already exists"
  );

duplicateError.code =
  "DUPLICATE_ORDER";

duplicateError.retryable =
  false;


fakeService3.error =
  duplicateError;


const endpoint3 =
  new OrderEndpoint(fakeService3);


const result3 =
  await endpoint3.create({
    provider: "telegram"
  });


console.log(
  "Success:",
  result3.success
);

console.log(
  "Code:",
  result3.code
);

console.log(
  "Retryable:",
  result3.retryable
);


console.assert(
  result3.success === false,
  "Duplicate order should fail"
);

console.assert(
  result3.code === "DUPLICATE_ORDER",
  "Duplicate error code should be preserved"
);

console.assert(
  result3.retryable === false,
  "Duplicate order must not be retryable"
);

console.log(
  "✓ CMS duplicate error mapping works\n"
);


/**
 * ============================================================
 * TEST 4 — Retryable CMS error mapping
 * ============================================================
 */

console.log("=== TEST 4: Retryable CMS Error Mapping ===");

const fakeService4 =
  new FakeOrderService();


const transientError =
  new Error(
    "Google Sheets temporarily unavailable"
  );

transientError.code =
  "SHEETS_ERROR";

transientError.retryable =
  true;


fakeService4.error =
  transientError;


const endpoint4 =
  new OrderEndpoint(fakeService4);


const result4 =
  await endpoint4.create({
    provider: "telegram"
  });


console.log(
  "Success:",
  result4.success
);

console.log(
  "Code:",
  result4.code
);

console.log(
  "Retryable:",
  result4.retryable
);


console.assert(
  result4.success === false,
  "Transient error should fail"
);

console.assert(
  result4.code === "SHEETS_ERROR",
  "CMS error code should be preserved"
);

console.assert(
  result4.retryable === true,
  "Retryable flag should be preserved"
);

console.log(
  "✓ Retryable error mapping works\n"
);


/**
 * ============================================================
 * FINAL
 * ============================================================
 */

console.log(
  "=== ALL ORDER ENDPOINT TESTS PASSED ==="
);
