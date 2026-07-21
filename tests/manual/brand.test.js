import assert from "node:assert/strict";

import {
  createBrand
} from "../../src/index.js";

// -----------------------------------------------------------------------------
// Factory
// -----------------------------------------------------------------------------

const brand = createBrand({
  name: "Rado"
});

assert.equal(brand.name, "Rado");

// -----------------------------------------------------------------------------
// Default values
// -----------------------------------------------------------------------------

assert.equal(brand.id, "");
assert.equal(brand.country, "");
assert.equal(brand.enabled, true);

// -----------------------------------------------------------------------------
// Type normalization
// -----------------------------------------------------------------------------

const disabledBrand = createBrand({
  enabled: 0
});

assert.equal(disabledBrand.enabled, false);

const enabledBrand = createBrand({
  enabled: 1
});

assert.equal(enabledBrand.enabled, true);

// -----------------------------------------------------------------------------
// Immutability
// -----------------------------------------------------------------------------

assert.ok(Object.isFrozen(brand));

console.log("✅ createBrand() passed");