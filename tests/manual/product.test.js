import {
  createProduct,
  validate
} from "../../src/index.js";

import assert from "node:assert/strict";

// -----------------------------------------------------------------------------
// Factory
// Creates a Product object from input data.
// -----------------------------------------------------------------------------

const product = createProduct({
  sku: "TEST001",
  name: "Test Product",
  price: 100
});

// -----------------------------------------------------------------------------
// Default values
// Verifies default values for properties not provided by the user.
// -----------------------------------------------------------------------------

assert.equal(product.sku, "TEST001");
assert.equal(product.price, 100);
assert.equal(product.currency, "UAH");
assert.equal(product.status, "draft");
assert.equal(product.featuredHome, false);
assert.equal(product.sortOrder, 0);
assert.equal(product.id, "");
assert.equal(product.category, "");
assert.equal(product.brand, "");
assert.equal(product.description, "");
assert.equal(product.dateAdded, "");
assert.equal(product.notes, "");
assert.deepEqual(product.media, []);
assert.equal(Array.isArray(product.media), true);
assert.equal(product.name, "Test Product");

// -----------------------------------------------------------------------------
// Type normalization
// Converts incoming values to the expected runtime types.
// -----------------------------------------------------------------------------

const normalized = createProduct({
  price: "250",
  sortOrder: "5",
  featuredHome: 1
});

assert.equal(normalized.price, 250);
assert.equal(normalized.sortOrder, 5);
assert.equal(normalized.featuredHome, true);

// -----------------------------------------------------------------------------
// Immutability
// Ensures created objects cannot be modified.
// -----------------------------------------------------------------------------

assert.equal(Object.isFrozen(product), true);
assert.equal(Object.isFrozen(normalized), true);

// -----------------------------------------------------------------------------
// Empty object
// Verifies behavior when createProduct() is called without arguments.
// -----------------------------------------------------------------------------

const empty = createProduct();

assert.equal(empty.sku, "");
assert.equal(empty.price, 0);
assert.equal(empty.currency, "UAH");
assert.equal(Object.isFrozen(empty), true);

// -----------------------------------------------------------------------------
// Validation
// Verifies validation results for valid and invalid products.
// -----------------------------------------------------------------------------

const validProduct = createProduct({
  sku: "W0001",
  name: "Omega",
  price: 5000
});

const errors = validate("product", validProduct);

assert.deepEqual(errors, []);

const invalidProduct = createProduct({
  name: "Omega"
});

const invalidErrors = validate("product", invalidProduct);

assert.equal(invalidErrors.length, 1);
assert.equal(invalidErrors[0].field, "sku");

// -----------------------------------------------------------------------------
// Invalid factory input
// Verifies unsupported input types.
// null is treated as an empty object by design.
// -----------------------------------------------------------------------------

const nullProduct = createProduct(null);

assert.equal(nullProduct.sku, "");
assert.equal(nullProduct.price, 0);

assert.throws(() => createProduct([]));
assert.throws(() => createProduct("product"));
assert.throws(() => createProduct(123));
assert.throws(() => createProduct(true));

console.log("✅ createProduct() passed");