/**
 * ============================================================
 * PREVIA Core
 * Real Order Endpoint Integration Test
 * ============================================================
 *
 * Tests:
 *
 * OrderEndpoint
 *      ↓
 * real OrderService
 *      ↓
 * real ValidationService / OrderValidator
 *      ↓
 * fake Repository
 *
 * No HTTP.
 * No CMS.
 * No network.
 *
 * ============================================================
 */

import { OrderEndpoint } from "../../src/api/OrderEndpoint.js";
import { OrderService } from "../../src/services/OrderService.js";


/**
 * ============================================================
 * Fake Repository
 * ============================================================
 */

class FakeOrderRepository {

  constructor() {
    this.savedOrder = null;
    this.savedItems = null;
  }


  async save(order, items) {

    this.savedOrder = order;
    this.savedItems = items;

    return {
      order,
      items
    };

  }


  async findById(orderId) {

    if (
      !this.savedOrder ||
      this.savedOrder.order_id !== orderId
    ) {
      return null;
    }

    return {
      order: this.savedOrder,
      items: this.savedItems
    };

  }

}


/**
 * ============================================================
 * TEST DATA
 * ============================================================
 */

const repository =
  new FakeOrderRepository();


const service =
  new OrderService(repository);


const endpoint =
  new OrderEndpoint(service);


/**
 * ============================================================
 * TEST 1 — Real Order Creation
 * ============================================================
 */

console.log(
  "=== TEST 1: Real Order Creation ==="
);


const result =
  await endpoint.create({

    provider:
      "telegram",

    providerId:
      "123456789",

    telegram_name:
      "Test User",

    customer_name:
      "Test Customer",

    phone:
      "+380000000000",

    email:
      "test@example.com",

    payment_method:
      "card",

    items: [

      {
        sku:
          "TEST-001",

        title:
          "Test Vintage Watch",

        price:
          250,

        quantity:
          1
      }

    ]

  });


console.log(
  "Success:",
  result.success
);

console.log(
  "Order ID:",
  result.order_id
);

console.log(
  "Created at:",
  result.created_at
);


console.assert(
  result.success === true,
  "Order creation should succeed"
);

console.assert(
  typeof result.order_id === "string",
  "Order ID should be generated"
);

console.assert(
  result.order_id.startsWith("ORD-"),
  "Order ID should start with ORD-"
);

console.assert(
  typeof result.created_at === "string",
  "created_at should be generated"
);


console.assert(
  repository.savedOrder !== null,
  "Repository should receive the order"
);

console.assert(
  repository.savedItems.length === 1,
  "Repository should receive one item"
);


console.assert(
  repository.savedItems[0].order_id ===
    repository.savedOrder.order_id,

  "OrderItem order_id should match Order order_id"
);


console.assert(
  repository.savedOrder.subtotal === 250,

  "Order subtotal should be calculated"
);


console.assert(
  repository.savedOrder.total === 250,

  "Order total should be calculated"
);


console.log(
  "✓ Real OrderService chain works\n"
);


/**
 * ============================================================
 * TEST 2 — Server Defaults
 * ============================================================
 */

console.log(
  "=== TEST 2: Server Defaults ==="
);


console.log(
  "Source:",
  repository.savedOrder.source
);

console.log(
  "Payment type:",
  repository.savedOrder.payment_type
);

console.log(
  "Order status:",
  repository.savedOrder.order_status
);

console.log(
  "Payment status:",
  repository.savedOrder.payment_status
);


console.assert(
  repository.savedOrder.source ===
    "vintage_app",

  "source should be vintage_app"
);


console.assert(
  repository.savedOrder.payment_type ===
    "full",

  "payment_type should be full"
);


console.assert(
  repository.savedOrder.order_status ===
    "new",

  "order_status should be new"
);


console.assert(
  repository.savedOrder.payment_status ===
    "pending",

  "payment_status should be pending"
);


console.log(
  "✓ Server defaults are enforced\n"
);


/**
 * ============================================================
 * TEST 3 — Invalid Provider
 * ============================================================
 */

console.log(
  "=== TEST 3: Invalid Provider ==="
);


const invalidProvider =
  await endpoint.create({

    provider:
      "instagram",

    providerId:
      "123",

    telegram_name:
      "Test User",

    customer_name:
      "Test Customer",

    phone:
      "+380000000000",

    email:
      "test@example.com",

    payment_method:
      "card",

    items: [

      {
        sku:
          "TEST-002",

        title:
          "Test Item",

        price:
          100,

        quantity:
          1
      }

    ]

  });


console.log(
  "Success:",
  invalidProvider.success
);

console.log(
  "Code:",
  invalidProvider.code
);

console.log(
  "Message:",
  invalidProvider.message
);


console.assert(
  invalidProvider.success === false,

  "Invalid provider should fail"
);


console.assert(
  invalidProvider.code ===
    "VALIDATION_ERROR",

  "Invalid provider should return validation error"
);


console.log(
  "✓ Provider validation works\n"
);


/**
 * ============================================================
 * TEST 4 — Client Cannot Set Order ID
 * ============================================================
 */

console.log(
  "=== TEST 4: Client Order ID Rejection ==="
);


const clientOrderId =
  await endpoint.create({

    order_id:
      "CLIENT-SUPPLIED-ID",

    provider:
      "telegram",

    providerId:
      "123456789",

    telegram_name:
      "Test User",

    customer_name:
      "Test Customer",

    phone:
      "+380000000000",

    email:
      "test@example.com",

    payment_method:
      "card",

    items: [

      {
        sku:
          "TEST-003",

        title:
          "Test Item",

        price:
          100,

        quantity:
          1
      }

    ]

  });


console.log(
  "Success:",
  clientOrderId.success
);

console.log(
  "Code:",
  clientOrderId.code
);


console.assert(
  clientOrderId.success === false,

  "Client-supplied order ID should be rejected"
);


console.assert(
  clientOrderId.code ===
    "VALIDATION_ERROR",

  "Client order ID should cause validation error"
);


console.log(
  "✓ Server-side order ID protection works\n"
);


/**
 * ============================================================
 * FINAL
 * ============================================================
 */

console.log(
  "=== ALL REAL ORDER ENDPOINT TESTS PASSED ==="
);
