import assert from "node:assert/strict";

import {
  MemoryProductRepository,
  ProductOrderEnrichmentService,
  OrderService
} from "../../src/index.js";

function baseOrder(items, idempotency_key) {
  return {
    provider: "telegram",
    providerId: "123456789",
    telegram_name: "Test User",
    telegram_username: "testuser",
    customer_name: "Test User",
    phone: "+380000000000",
    email: "test@example.com",
    contact_preferences: ["telegram"],
    payment_method: "manual",
    idempotency_key,
    items
  };
}

async function run() {
  console.log("=== PREVIA Core Order Product Authority Test ===");

  const products = [
    {
      sku: "W-100",
      name: "Authoritative Watch",
      price: 1250,
      status: "available"
    },
    {
      sku: "W-200",
      name: "Reserved Watch",
      price: 900,
      status: "reserved"
    }
  ];

  const productRepository = new MemoryProductRepository(products);
  const enrichment = new ProductOrderEnrichmentService(productRepository);
  const service = new OrderService(null, enrichment);

  const tampered = await service.saveOrder(baseOrder([
    {
      sku: "W-100",
      title: "FAKE CLIENT TITLE",
      price: 1,
      quantity: 1
    }
  ], "product-authority-test-001"));

  assert.equal(tampered.items[0].title, "Authoritative Watch");
  assert.equal(tampered.items[0].price, 1250);
  assert.equal(tampered.order.total, 1250);
  console.log("✓ Client title/price ignored in favor of authoritative product data");

  await assert.rejects(
    () => service.saveOrder(baseOrder([
      {
        sku: "W-999",
        title: "Unknown",
        price: 1,
        quantity: 1
      }
    ], "product-authority-test-002")),
    error => error.code === "VALIDATION_ERROR" && error.retryable === false
  );
  console.log("✓ Unknown SKU rejected");

  await assert.rejects(
    () => service.saveOrder(baseOrder([
      {
        sku: "W-200",
        title: "Reserved Watch",
        price: 900,
        quantity: 1
      }
    ], "product-authority-test-003")),
    error => error.code === "VALIDATION_ERROR" && error.retryable === false
  );
  console.log("✓ Unavailable SKU rejected");

  console.log("ALL PRODUCT AUTHORITY TESTS PASSED");
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
