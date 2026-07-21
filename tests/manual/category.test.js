import assert from "node:assert/strict";

import {
  createCategory
} from "../../src/index.js";

// -----------------------------------------------------------------------------
// Factory
// -----------------------------------------------------------------------------

const category = createCategory({
  name: "Watches"
});

assert.equal(category.name, "Watches");

// -----------------------------------------------------------------------------
// Default values
// -----------------------------------------------------------------------------

assert.equal(category.id, "");
assert.equal(category.slug, "");
assert.equal(category.enabled, true);
assert.equal(category.sortOrder, 0);

// -----------------------------------------------------------------------------
// Type normalization
// -----------------------------------------------------------------------------

const hiddenCategory = createCategory({
  enabled: 0
});

assert.equal(hiddenCategory.enabled, false);

const visibleCategory = createCategory({
  enabled: 1
});

assert.equal(visibleCategory.enabled, true);

const orderedCategory = createCategory({
  sortOrder: "15"
});

assert.equal(orderedCategory.sortOrder, 15);

// -----------------------------------------------------------------------------
// Immutability
// -----------------------------------------------------------------------------

assert.ok(Object.isFrozen(category));

console.log("✅ createCategory() passed");