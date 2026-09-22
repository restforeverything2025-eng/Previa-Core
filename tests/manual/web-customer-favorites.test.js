import assert from "node:assert/strict";

import {
  CustomerService,
  FavoritesManager,
  MemoryCustomerRepository,
  MemoryFavoritesRepository
} from "../../src/index.js";

async function run() {
  const customerRepository = new MemoryCustomerRepository();
  const favoritesRepository = new MemoryFavoritesRepository();

  const customerService = new CustomerService(customerRepository);
  const favoritesManager = new FavoritesManager(favoritesRepository);

  const firstCustomer = await customerService.getOrCreate({
    provider: "telegram",
    providerId: "123456",
    displayName: "Test User",
    username: "test_user"
  });

  assert.equal(firstCustomer.customerId, "C000001");

  const sameCustomer = await customerService.getOrCreate({
    provider: "telegram",
    providerId: "123456",
    displayName: "Test User",
    username: "test_user"
  });

  assert.equal(sameCustomer.customerId, firstCustomer.customerId);

  await favoritesManager.addFavorite(firstCustomer.customerId, "W0001");
  await favoritesManager.addFavorite(firstCustomer.customerId, "W0001");

  let favorites = await favoritesManager.getFavorites(firstCustomer.customerId);
  assert.equal(favorites.length, 1);
  assert.equal(favorites[0].productId, "W0001");

  await favoritesManager.syncFavorites(
    firstCustomer.customerId,
    ["W0001", "J0002"]
  );

  favorites = await favoritesManager.getFavorites(firstCustomer.customerId);
  assert.deepEqual(
    favorites.map(item => item.productId).sort(),
    ["J0002", "W0001"]
  );

  await favoritesManager.removeFavorite(firstCustomer.customerId, "W0001");
  favorites = await favoritesManager.getFavorites(firstCustomer.customerId);
  assert.deepEqual(
    favorites.map(item => item.productId),
    ["J0002"]
  );

  console.log("Web customer/favorites Core test passed.");
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
