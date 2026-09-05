import {
  Order,
  OrderItem,
  validateOrder,
  validate,
  OrderService,
  OrderRepository,
  MemoryOrderRepository,
  ORDER_DEFAULTS
} from "../../src/index.js";

(async () => {

console.log("\n=== PHASE 1: Order Composition & Validation ===\n");

// ========================================
// TEST 1: Order ID Generation (Server-side)
// ========================================
console.log("TEST 1: Order ID generation (server-side)");
console.log("------------------------------------------");

const service1 = new OrderService();
const result1 = service1.createOrder({
  provider: "telegram",
  providerId: "1234567890",
  telegram_name: "John Doe",
  customer_name: "John Doe",
  phone: "+380123456789",
  email: "john@example.com",
  payment_method: "card",
  items: [
    {
      sku: "W0001",
      title: "Vintage Watch",
      price: 150,
      quantity: 1
    }
  ]
});

console.log("Generated order_id:", result1.order.order_id);
console.assert(
  result1.order.order_id.startsWith("ORD-"),
  "order_id should start with 'ORD-'"
);
console.assert(
  result1.order.order_id.length === 40, // "ORD-" (4) + UUIDv4 (36)
  "order_id should be ORD-<36-char-uuid>"
);
console.log("✓ order_id correctly generated\n");

// ========================================
// TEST 2: created_at Generation (Server-side, ISO 8601 UTC)
// ========================================
console.log("TEST 2: created_at generation (ISO 8601 UTC)");
console.log("--------------------------------------------");

const beforeCreation = new Date();
const result2 = service1.createOrder({
  provider: "telegram",
  providerId: "9876543210",
  telegram_name: "Jane Doe",
  customer_name: "Jane Doe",
  phone: "+380987654321",
  email: "jane@example.com",
  payment_method: "card",
  items: [
    {
      sku: "J0001",
      title: "Jewelry",
      price: 200,
      quantity: 1
    }
  ]
});
const afterCreation = new Date();

console.log("Generated created_at:", result2.order.created_at);
console.assert(
  typeof result2.order.created_at === "string",
  "created_at should be a string"
);
console.assert(
  result2.order.created_at.includes("T"),
  "created_at should be ISO 8601 format"
);
console.assert(
  result2.order.created_at.endsWith("Z"),
  "created_at should end with Z (UTC)"
);

const createdAtTime = new Date(result2.order.created_at);
console.assert(
  createdAtTime >= beforeCreation && createdAtTime <= afterCreation,
  "created_at should be within test execution time"
);
console.log("✓ created_at correctly generated in ISO 8601 UTC\n");

// ========================================
// TEST 3: Defaults Enforcement
// ========================================
console.log("TEST 3: Defaults enforcement");
console.log("---------------------------");

const result3 = service1.createOrder({
  provider: "telegram",
  providerId: "1111111111",
  telegram_name: "Test User",
  customer_name: "Test User",
  phone: "+380111111111",
  email: "test@example.com",
  payment_method: "card",
  items: [
    {
      sku: "T0001",
      title: "Test Item",
      price: 100,
      quantity: 1
    }
  ]
});

console.log("Expected defaults:");
console.log("  source:", ORDER_DEFAULTS.source);
console.log("  payment_type:", ORDER_DEFAULTS.payment_type);
console.log("  order_status:", ORDER_DEFAULTS.order_status);
console.log("  payment_status:", ORDER_DEFAULTS.payment_status);

console.log("Actual order values:");
console.log("  source:", result3.order.source);
console.log("  payment_type:", result3.order.payment_type);
console.log("  order_status:", result3.order.order_status);
console.log("  payment_status:", result3.order.payment_status);

console.assert(
  result3.order.source === ORDER_DEFAULTS.source,
  "source should be 'vintage_app'"
);
console.assert(
  result3.order.payment_type === ORDER_DEFAULTS.payment_type,
  "payment_type should be 'full'"
);
console.assert(
  result3.order.order_status === ORDER_DEFAULTS.order_status,
  "order_status should be 'new'"
);
console.assert(
  result3.order.payment_status === ORDER_DEFAULTS.payment_status,
  "payment_status should be 'pending'"
);
console.log("✓ All defaults correctly enforced\n");

// ==========================================
// TEST 4: Provider validation
// ==========================================

console.log("\n## TEST 4: Provider validation");

const validOrder = {
  provider: "telegram",
  providerId: "test-provider-id",
  telegram_name: "Test User",
  customer_name: "Test Customer",
  phone: "+380000000000",
  email: "test@example.com",
  payment_method: "fop_details",
  items: [
    {
      sku: "TEST-001",
      title: "Test Product",
      price: 1000,
      quantity: 1
    }
  ]
};

// 4a. Telegram requires providerId and telegram_name

const telegramWithoutIdentity = {
  ...validOrder,
  provider: "telegram",
  providerId: "",
  telegram_name: ""
};

const telegramErrors =
  validate("order", telegramWithoutIdentity);

console.log(
  "4a. Telegram without identity:",
  telegramErrors
);

if (
  telegramErrors.includes(
    "providerId is required for telegram"
  ) &&
  telegramErrors.includes(
    "telegram_name is required for telegram"
  )
) {
  console.log(
    "✓ Telegram identity requirements enforced"
  );
} else {
  console.log(
    "✗ Telegram identity requirements failed"
  );
}


// 4b. Web order does not require Telegram identity

const webOrder = {
  ...validOrder,
  provider: "web",
  providerId: "",
  telegram_name: ""
};

const webErrors =
  validate("order", webOrder);

console.log(
  "4b. Web order without Telegram identity:",
  webErrors
);

if (webErrors.length === 0) {
  console.log(
    "✓ Web order correctly accepted without Telegram identity"
  );
} else {
  console.log(
    "✗ Web order should be accepted"
  );
}


// 4c. Unknown provider must be rejected

const unknownProviderOrder = {
  ...validOrder,
  provider: "instagram"
};

const unknownProviderErrors =
  validate("order", unknownProviderOrder);

console.log(
  "4c. Unknown provider:",
  unknownProviderErrors
);

if (
  unknownProviderErrors.includes(
    "provider must be 'telegram' or 'web'"
  )
) {
  console.log(
    "✓ Unknown provider correctly rejected"
  );
} else {
  console.log(
    "✗ Unknown provider should be rejected"
  );
}

// ========================================
// TEST 5: telegram_name Required
// ========================================
console.log("TEST 5: telegram_name requirement");
console.log("---------------------------------");

const errors5 = validateOrder({
  provider: "telegram",
  providerId: "123",
  // telegram_name: MISSING!
  customer_name: "User",
  phone: "+380123456789",
  email: "user@example.com",
  payment_method: "card",
  items: [{ sku: "X", title: "X", price: 100, quantity: 1 }]
});

console.log("Validation errors when telegram_name missing:");
console.log(errors5);
console.assert(
  errors5.some(e => e.includes("telegram_name")),
  "Should require telegram_name"
);
console.log("✓ telegram_name requirement enforced\n");

// ========================================
// TEST 6: Items Validation (1-3 items)
// ========================================
console.log("TEST 6: Items validation (1-3 items)");
console.log("------------------------------------");

// Test 6a: Zero items (should fail)
const errors6a = validateOrder({
  provider: "telegram",
  providerId: "123",
  telegram_name: "User",
  customer_name: "User",
  phone: "+380123456789",
  email: "user@example.com",
  payment_method: "card",
  items: []
});

console.log("6a. Zero items - errors:", errors6a);
console.assert(
  errors6a.some(e => e.includes("at least 1")),
  "Should reject empty items array"
);

// Test 6b: Four items (should fail)
const errors6b = validateOrder({
  provider: "telegram",
  providerId: "123",
  telegram_name: "User",
  customer_name: "User",
  phone: "+380123456789",
  email: "user@example.com",
  payment_method: "card",
  items: [
    { sku: "A", title: "A", price: 100, quantity: 1 },
    { sku: "B", title: "B", price: 100, quantity: 1 },
    { sku: "C", title: "C", price: 100, quantity: 1 },
    { sku: "D", title: "D", price: 100, quantity: 1 }
  ]
});

console.log("6b. Four items - errors:", errors6b);
console.assert(
  errors6b.some(e => e.includes("at most 3")),
  "Should reject more than 3 items"
);

// Test 6c: Valid 1-3 items (should pass)
const errors6c = validateOrder({
  provider: "telegram",
  providerId: "123",
  telegram_name: "User",
  customer_name: "User",
  phone: "+380123456789",
  email: "user@example.com",
  payment_method: "card",
  items: [
    { sku: "A", title: "A", price: 100, quantity: 1 },
    { sku: "B", title: "B", price: 200, quantity: 1 },
    { sku: "C", title: "C", price: 150, quantity: 1 }
  ]
});

console.log("6c. Valid 3 items - errors:", errors6c);
console.assert(
  errors6c.length === 0,
  "Should accept 1-3 items"
);
console.log("✓ Items count validation (1-3) works\n");

// ========================================
// TEST 7: Quantity Must Be 1
// ========================================
console.log("TEST 7: Quantity must be exactly 1");
console.log("----------------------------------");

const errors7 = validateOrder({
  provider: "telegram",
  providerId: "123",
  telegram_name: "User",
  customer_name: "User",
  phone: "+380123456789",
  email: "user@example.com",
  payment_method: "card",
  items: [
    { sku: "A", title: "A", price: 100, quantity: 2 } // Wrong quantity!
  ]
});

console.log("Validation errors for quantity != 1:");
console.log(errors7);
console.assert(
  errors7.some(e => e.includes("exactly 1")),
  "Should reject quantity != 1"
);
console.log("✓ Quantity constraint enforced\n");

// ========================================
// TEST 8: Duplicate SKU Prevention
// ========================================
console.log("TEST 8: Duplicate SKU prevention");
console.log("-------------------------------");

const errors8 = validateOrder({
  provider: "telegram",
  providerId: "123",
  telegram_name: "User",
  customer_name: "User",
  phone: "+380123456789",
  email: "user@example.com",
  payment_method: "card",
  items: [
    { sku: "SAME", title: "Item 1", price: 100, quantity: 1 },
    { sku: "SAME", title: "Item 2", price: 100, quantity: 1 } // Duplicate!
  ]
});

console.log("Validation errors for duplicate SKU:");
console.log(errors8);
console.assert(
  errors8.some(e => e.includes("duplicate")),
  "Should reject duplicate SKUs"
);
console.log("✓ Duplicate SKU prevention works\n");

// ========================================
// TEST 9: Price Validation
// ========================================
console.log("TEST 9: Price validation");
console.log("----------------------");

// Test 9a: Negative price
const errors9a = validateOrder({
  provider: "telegram",
  providerId: "123",
  telegram_name: "User",
  customer_name: "User",
  phone: "+380123456789",
  email: "user@example.com",
  payment_method: "card",
  items: [
    { sku: "A", title: "A", price: -100, quantity: 1 } // Negative!
  ]
});

console.log("9a. Negative price - errors:", errors9a);
console.assert(
  errors9a.some(e => e.includes("price")),
  "Should reject negative price"
);

// Test 9b: Zero price
const errors9b = validateOrder({
  provider: "telegram",
  providerId: "123",
  telegram_name: "User",
  customer_name: "User",
  phone: "+380123456789",
  email: "user@example.com",
  payment_method: "card",
  items: [
    { sku: "A", title: "A", price: 0, quantity: 1 } // Zero!
  ]
});

console.log("9b. Zero price - errors:", errors9b);
console.assert(
  errors9b.some(e => e.includes("price")),
  "Should reject zero price"
);

// Test 9c: Valid positive price
const errors9c = validateOrder({
  provider: "telegram",
  providerId: "123",
  telegram_name: "User",
  customer_name: "User",
  phone: "+380123456789",
  email: "user@example.com",
  payment_method: "card",
  items: [
    { sku: "A", title: "A", price: 99.99, quantity: 1 } // Valid!
  ]
});

console.log("9c. Valid positive price - errors:", errors9c);
console.assert(
  !errors9c.some(e => e.includes("price")),
  "Should accept positive price"
);
console.log("✓ Price validation works\n");

// ========================================
// TEST 10: Reject if App Provides order_id
// ========================================
console.log("TEST 10: Reject order_id from App");
console.log("--------------------------------");

const errors10 = validateOrder({
  order_id: "TEST-001", // App should NOT provide this!
  provider: "telegram",
  providerId: "123",
  telegram_name: "User",
  customer_name: "User",
  phone: "+380123456789",
  email: "user@example.com",
  payment_method: "card",
  items: [
    { sku: "A", title: "A", price: 100, quantity: 1 }
  ]
});

console.log("Validation errors when App provides order_id:");
console.log(errors10);
console.assert(
  errors10.some(e => e.includes("order_id")),
  "Should reject order_id from App"
);
console.log("✓ order_id from App correctly rejected\n");

// ========================================
// TEST 11: Memory Repository Integration
// ========================================
console.log("TEST 11: MemoryOrderRepository integration");
console.log("----------------------------------------");

const memoryRepository = new MemoryOrderRepository();
const service11 = new OrderService(memoryRepository);

const result11 = await service11.saveOrder({
  provider: "telegram",
  providerId: "2222222222",
  telegram_name: "Mem User",
  customer_name: "Mem User",
  phone: "+380222222222",
  email: "mem@example.com",
  payment_method: "card",
  items: [
    {
      sku: "M0001",
      title: "Memory Test Item",
      price: 250,
      quantity: 1
    }
  ]
});

console.log("Saved order_id:", result11.order.order_id);

const foundOrder = memoryRepository.findById(result11.order.order_id);
console.log("Found order:", foundOrder ? "✓ exists" : "✗ not found");
console.assert(
  foundOrder !== null,
  "Order should be retrievable from repository"
);
console.assert(
  foundOrder.order.order_id === result11.order.order_id,
  "Retrieved order_id should match"
);
console.log("✓ MemoryOrderRepository works with Phase 1\n");

// ==========================================
// TEST 12: Contact preferences validation
// ==========================================

console.log("\n## TEST 12: Contact preferences validation");

// 12a. Empty array is valid

const noContactPreference = {
  ...validOrder,
  provider: "web",
  contact_preferences: []
};

const noContactErrors =
  validate("order", noContactPreference);

console.log(
  "12a. Empty contact preferences:",
  noContactErrors
);

if (noContactErrors.length === 0) {
  console.log(
    "✓ Empty contact preferences accepted"
  );
} else {
  console.log(
    "✗ Empty contact preferences should be accepted"
  );
}


// 12b. Valid contact preferences

const validContactPreference = {
  ...validOrder,
  provider: "web",
  contact_preferences: [
    "telegram",
    "viber",
    "call"
  ]
};

const validContactErrors =
  validate("order", validContactPreference);

console.log(
  "12b. Valid contact preferences:",
  validContactErrors
);

if (validContactErrors.length === 0) {
  console.log(
    "✓ Valid contact preferences accepted"
  );
} else {
  console.log(
    "✗ Valid contact preferences should be accepted"
  );
}


// 12c. Non-array value must be rejected

const invalidContactType = {
  ...validOrder,
  provider: "web",
  contact_preferences: "telegram"
};

const invalidTypeErrors =
  validate("order", invalidContactType);

console.log(
  "12c. Invalid contact preferences type:",
  invalidTypeErrors
);

if (
  invalidTypeErrors.includes(
    "contact_preferences must be an array"
  )
) {
  console.log(
    "✓ Invalid contact preferences type rejected"
  );
} else {
  console.log(
    "✗ Invalid contact preferences type should be rejected"
  );
}


// 12d. Unknown contact channel must be rejected

const invalidContactValue = {
  ...validOrder,
  provider: "web",
  contact_preferences: [
    "telegram",
    "whatsapp"
  ]
};

const invalidValueErrors =
  validate("order", invalidContactValue);

console.log(
  "12d. Invalid contact preference value:",
  invalidValueErrors
);

if (
  invalidValueErrors.includes(
    "contact_preferences contains invalid value(s)"
  )
) {
  console.log(
    "✓ Invalid contact preference value rejected"
  );
} else {
  console.log(
    "✗ Invalid contact preference value should be rejected"
  );
}

// ==========================================
// TEST 13: OrderItem composition
// ==========================================

console.log("\n## TEST 13: OrderItem composition");

const orderItemInput = {
  order_id: "ORD-TEST-001",
  sku: "TEST-001",
  title: "Test Product",
  price: 1500,
  quantity: 1,
  subtotal: 1500
};

const orderItem = new OrderItem(orderItemInput);

console.log("Created OrderItem:", orderItem);

if (
  orderItem.order_id === "ORD-TEST-001" &&
  orderItem.sku === "TEST-001" &&
  orderItem.title === "Test Product" &&
  orderItem.price === 1500 &&
  orderItem.quantity === 1 &&
  orderItem.subtotal === 1500
) {
  console.log(
    "✓ OrderItem fields correctly composed"
  );
} else {
  console.log(
    "✗ OrderItem fields composition failed"
  );
}


// 13b. OrderService calculates subtotal

const serviceOrder = {
  ...validOrder,
  provider: "web",
  contact_preferences: [],
  items: [
    {
      sku: "TEST-002",
      title: "Another Product",
      price: 2500,
      quantity: 1
    }
  ]
};

const serviceResult =
  service1.createOrder(serviceOrder);

console.log(
  "OrderItem created by OrderService:",
  serviceResult.items[0]
);

if (
  serviceResult.items.length === 1 &&
  serviceResult.items[0].sku === "TEST-002" &&
  serviceResult.items[0].title === "Another Product" &&
  serviceResult.items[0].price === 2500 &&
  serviceResult.items[0].quantity === 1 &&
  serviceResult.items[0].subtotal === 2500 &&
  serviceResult.order.subtotal === 2500 &&
  serviceResult.order.total === 2500
) {
  console.log(
    "✓ OrderService correctly creates OrderItem and calculates totals"
  );
} else {
  console.log(
    "✗ OrderService OrderItem or totals failed"
  );
}

// ==========================================
// TEST 14: Contact preferences in Order
// ==========================================

console.log("\n## TEST 14: Contact preferences in Order");

const orderWithContacts = {
  ...validOrder,
  provider: "web",
  providerId: "",
  telegram_name: "",
  contact_preferences: [
    "telegram",
    "viber"
  ],
  items: [
    {
      sku: "TEST-003",
      title: "Contact Test Product",
      price: 3000,
      quantity: 1
    }
  ]
};

const contactOrderResult =
  service1.createOrder(orderWithContacts);

console.log(
  "Order contact_preferences:",
  contactOrderResult.order.contact_preferences
);

if (
  Array.isArray(
    contactOrderResult.order.contact_preferences
  ) &&
  contactOrderResult.order.contact_preferences.length === 2 &&
  contactOrderResult.order.contact_preferences[0] === "telegram" &&
  contactOrderResult.order.contact_preferences[1] === "viber"
) {
  console.log(
    "✓ contact_preferences correctly stored in Order"
  );
} else {
  console.log(
    "✗ contact_preferences were not stored correctly"
  );
}

console.log("\n=== PHASE 1 TESTS COMPLETE ===\n");

})();