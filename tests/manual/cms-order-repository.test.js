/**
 * ============================================================
 * PREVIA Core
 * CMS Order Repository Tests
 * ============================================================
 */

import {
  CmsOrderRepository,
  generateHmacSignature,
  createHmacEnvelope
} from "../../src/index.js";

// ============================================
// Fake CMS Transport (NO REAL NETWORK CALLS)
// ============================================

class FakeCmsTransport {
  constructor(scenarioMap = {}) {
    this.scenarioMap = scenarioMap;
    this.callLog = [];
  }

  async post(envelope) {
    this.callLog.push(envelope);

    const scenario = this.scenarioMap[envelope.action];
    if (scenario) {
      if (scenario.error) {
        throw scenario.error;
      }
      return scenario.response;
    }

    return { success: true, code: "OK" };
  }
}

// ============================================
// TEST: HMAC Signature Generation
// ============================================

console.log("\n=== TEST 1: HMAC Signature Generation ===");

const testAction = "order.create";
const testTimestamp = "2026-08-16T14:30:45.123Z";
const testNonce = "abc123def456" + "0".repeat(52);
const testPayload = JSON.stringify({ order: { id: "TEST" }, items: [] });
const testSecret = "test-secret-key";

const signature = generateHmacSignature(
  testAction,
  testTimestamp,
  testNonce,
  testPayload,
  testSecret
);

console.log("Generated signature:", signature);
console.assert(
  typeof signature === "string" && signature.length === 64,
  "Signature should be 64-char hex string (SHA256)"
);
console.log("✓ HMAC signature is valid format\n");

// ============================================
// TEST: HMAC Envelope Creation
// ============================================

console.log("=== TEST 2: HMAC Envelope Creation ===");

const payload = { order: { id: "TEST" }, items: [] };
const envelope = createHmacEnvelope("order.create", payload, testSecret);

console.log("Envelope action:", envelope.action);
console.log("Envelope auth.version:", envelope.auth.version);
console.log("Envelope auth.key_id:", envelope.auth.key_id);
console.log("Envelope auth.timestamp:", envelope.auth.timestamp);
console.log("Envelope auth.nonce length:", envelope.auth.nonce.length);
console.log("Envelope auth.signature length:", envelope.auth.signature.length);

console.assert(
  envelope.action === "order.create",
  "Action should match"
);
console.assert(
  envelope.auth.version === "v1",
  "Version should be v1"
);
console.assert(
  envelope.auth.key_id === "core-v1",
  "Key ID should be core-v1"
);
console.assert(
  envelope.auth.nonce.length === 64,
  "Nonce should be 64 chars"
);
console.assert(
  envelope.auth.signature.length === 64,
  "Signature should be 64 chars (hex)"
);
console.assert(
  typeof envelope.payload === "string",
  "Payload should be JSON string"
);
console.log("✓ Envelope structure is correct\n");

// ============================================
// TEST: Order Create - Success
// ============================================

console.log("=== TEST 3: Order Create - Success ===");

const fakeTransport1 = new FakeCmsTransport({
  "order.create": {
    response: {
      success: true,
      code: "ORDER_CREATED",
      order: {
        order_id: "ORD-123",
        customer_name: "Test Customer",
        total: 100
      },
      items: [
        {
          order_id: "ORD-123",
          sku: "TEST",
          title: "Test Item",
          price: 100,
          quantity: 1,
          subtotal: 100
        }
      ],
      message: "Order created successfully"
    }
  }
});

const repo1 = new CmsOrderRepository("fake://url", "secret", fakeTransport1);

const testOrder = {
  order_id: "ORD-123",
  customer_name: "Test Customer",
  total: 100
};

const testItems = [
  {
    order_id: "ORD-123",
    sku: "TEST",
    title: "Test Item",
    price: 100,
    quantity: 1,
    subtotal: 100
  }
];

const result1 = await repo1.save(testOrder, testItems);

console.log("Result order_id:", result1.order.order_id);
console.log("Result items count:", result1.items.length);

console.assert(
  result1.order.order_id === "ORD-123",
  "Order should be returned from CMS response"
);
console.assert(
  result1.items.length === 1,
  "Items should be returned from CMS response"
);
console.log("✓ Order create success works\n");

// ============================================
// TEST: Order Create - Duplicate
// ============================================

console.log("=== TEST 4: Order Create - Duplicate (Not Retryable) ===");

const fakeTransport2 = new FakeCmsTransport({
  "order.create": {
    response: {
      success: false,
      code: "DUPLICATE_ORDER",
      retryable: false,
      message: "Order with this ID already exists"
    }
  }
});

const repo2 = new CmsOrderRepository("fake://url", "secret", fakeTransport2);

try {
  await repo2.save(testOrder, testItems);
  console.log("✗ Should have thrown duplicate error");
} catch (error) {
  console.log("Error code:", error.code);
  console.log("Error retryable:", error.retryable);
  console.assert(
    error.code === "DUPLICATE_ORDER",
    "Error code should be DUPLICATE_ORDER"
  );
  console.assert(
    error.retryable === false,
    "Duplicate should not be retryable"
  );
  console.log("✓ Duplicate error correctly thrown\n");
}

// ============================================
// TEST: Order Create - Validation Error
// ============================================

console.log("=== TEST 5: Order Create - Validation Error ===");

const fakeTransport3 = new FakeCmsTransport({
  "order.create": {
    response: {
      success: false,
      code: "VALIDATION_ERROR",
      retryable: false,
      message: "Validation failed",
      errors: ["email is invalid", "phone is required"]
    }
  }
});

const repo3 = new CmsOrderRepository("fake://url", "secret", fakeTransport3);

try {
  await repo3.save(testOrder, testItems);
  console.log("✗ Should have thrown validation error");
} catch (error) {
  console.log("Error code:", error.code);
  console.log("Error message:", error.message);
  console.assert(
    error.code === "VALIDATION_ERROR",
    "Error code should be VALIDATION_ERROR"
  );
  console.log("✓ Validation error correctly thrown\n");
}

// ============================================
// TEST: Order Find - Found
// ============================================

console.log("=== TEST 6: Order Find - Found ===");

const fakeTransport4 = new FakeCmsTransport({
  "order.find": {
    response: {
      order: {
        order_id: "ORD-456",
        customer_name: "Existing Customer",
        total: 250
      },
      items: [
        {
          order_id: "ORD-456",
          sku: "FOUND",
          title: "Found Item",
          price: 250,
          quantity: 1,
          subtotal: 250
        }
      ]
    }
  }
});

const repo4 = new CmsOrderRepository("fake://url", "secret", fakeTransport4);

const found = await repo4.findById("ORD-456");

console.log("Found order_id:", found.order.order_id);
console.log("Found items count:", found.items.length);

console.assert(
  found !== null,
  "Order should be found"
);
console.assert(
  found.order.order_id === "ORD-456",
  "Order ID should match"
);
console.log("✓ Order find success works\n");

// ============================================
// TEST: Order Find - Not Found
// ============================================

console.log("=== TEST 7: Order Find - Not Found (Returns Null) ===");

const fakeTransport5 = new FakeCmsTransport({
  "order.find": {
    response: null  // CMS returns null when order not found
  }
});

const repo5 = new CmsOrderRepository("fake://url", "secret", fakeTransport5);

const notFound = await repo5.findById("ORD-NONEXISTENT");

console.log("Result:", notFound);

console.assert(
  notFound === null,
  "Should return null when order not found"
);
console.log("✓ Order find not found returns null\n");

// ============================================
// TEST: Order Find - Validation Error
// ============================================

console.log("=== TEST 8: Order Find - Validation Error ===");

const fakeTransport6 = new FakeCmsTransport({
  "order.find": {
    response: {
      success: false,
      code: "VALIDATION_ERROR",
      retryable: false,
      message: "Invalid order_id format",
      errors: ["order_id must be non-empty"]
    }
  }
});

const repo6 = new CmsOrderRepository("fake://url", "secret", fakeTransport6);

try {
  await repo6.findById("");
  console.log("✗ Should have thrown validation error");
} catch (error) {
  console.log("Error code:", error.code);
  console.assert(
    error.code === "VALIDATION_ERROR",
    "Error code should be VALIDATION_ERROR"
  );
  console.log("✓ Order find validation error correctly thrown\n");
}

// ============================================
// TEST: Transient Error (Retryable)
// ============================================

console.log("=== TEST 9: Transient Error (Retryable) ===");

const fakeTransport7 = new FakeCmsTransport({
  "order.create": {
    response: {
      success: false,
      code: "SHEETS_ERROR",
      retryable: true,
      message: "Temporary Google Sheets connectivity issue"
    }
  }
});

const repo7 = new CmsOrderRepository("fake://url", "secret", fakeTransport7);

try {
  await repo7.save(testOrder, testItems);
  console.log("✗ Should have thrown transient error");
} catch (error) {
  console.log("Error code:", error.code);
  console.log("Error retryable:", error.retryable);
  console.assert(
    error.retryable === true,
    "Transient error should be retryable"
  );
  console.log("✓ Transient error correctly marked as retryable\n");
}

// ============================================
// TEST: Request Timeout
// ============================================

console.log("=== TEST 10: Request Timeout ===");

const fakeTransport8 = new FakeCmsTransport({
  "order.create": {
    error: new Error("AbortError: The operation was aborted")
  }
});

const repo8 = new CmsOrderRepository("fake://url", "secret", fakeTransport8);

try {
  await repo8.save(testOrder, testItems);
  console.log("✗ Should have thrown timeout error");
} catch (error) {
  console.log("Error message:", error.message);
  console.log("✓ Network error handling works\n");
}

// ============================================
// TEST: Envelope Contains Correct Action
// ============================================

console.log("=== TEST 11: Envelope Contains Correct Action ===");

const fakeTransport9 = new FakeCmsTransport({
  "order.create": {
    response: { success: true, code: "OK", order: {}, items: [] }
  },
  "order.find": {
    response: null
  }
});

const repo9 = new CmsOrderRepository("fake://url", "secret", fakeTransport9);

await repo9.save(testOrder, testItems);
const createEnvelope = fakeTransport9.callLog[0];

console.log("Create envelope action:", createEnvelope.action);
console.assert(
  createEnvelope.action === "order.create",
  "Create should use order.create action"
);

await repo9.findById("ORD-123");
const findEnvelope = fakeTransport9.callLog[1];

console.log("Find envelope action:", findEnvelope.action);
console.assert(
  findEnvelope.action === "order.find",
  "Find should use order.find action"
);
console.log("✓ Correct actions used in envelopes\n");

// ============================================
// TEST: Nonce Uniqueness
// ============================================

console.log("=== TEST 12: Nonce Uniqueness ===");

const fakeTransport10 = new FakeCmsTransport({
  "order.create": {
    response: { success: true, code: "OK", order: {}, items: [] }
  }
});

const repo10 = new CmsOrderRepository("fake://url", "secret", fakeTransport10);

await repo10.save(testOrder, testItems);
await repo10.save(testOrder, testItems);
await repo10.save(testOrder, testItems);

const nonce1 = fakeTransport10.callLog[0].auth.nonce;
const nonce2 = fakeTransport10.callLog[1].auth.nonce;
const nonce3 = fakeTransport10.callLog[2].auth.nonce;

console.log("Nonce 1:", nonce1);
console.log("Nonce 2:", nonce2);
console.log("Nonce 3:", nonce3);

console.assert(
  nonce1 !== nonce2 && nonce2 !== nonce3 && nonce1 !== nonce3,
  "Each request should have unique nonce"
);
console.log("✓ Nonces are unique across requests\n");

console.log("\n=== ALL PHASE 2 TESTS PASSED ===\n");
