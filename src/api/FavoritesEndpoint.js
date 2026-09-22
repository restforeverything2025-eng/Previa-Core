/**
 * ============================================================
 * PREVIA Core
 * Favorites Endpoint
 * ============================================================
 *
 * Application-facing adapter for cloud favorites.
 * ============================================================
 */

class FavoritesEndpoint {
  constructor(favoritesManager) {
    if (!favoritesManager) {
      throw new Error("Favorites manager is required.");
    }

    this.favoritesManager = favoritesManager;
  }

  async getFavorites(customerId) {
    this._validate(customerId);
    return this.favoritesManager.getFavorites(customerId);
  }

  async addFavorite(customerId, productId) {
    this._validate(customerId, productId);
    return this.favoritesManager.addFavorite(customerId, productId);
  }

  async removeFavorite(customerId, productId) {
    this._validate(customerId, productId);
    return this.favoritesManager.removeFavorite(customerId, productId);
  }

  async syncFavorites(customerId, localProductIds) {
    this._validate(customerId);
    return this.favoritesManager.syncFavorites(customerId, localProductIds);
  }

  _validate(customerId, productId = undefined) {
    if (!customerId || (productId === undefined && arguments.length > 1)) {
      throw Object.assign(new Error("Customer ID is required."), {
        code: "VALIDATION_ERROR",
        retryable: false
      });
    }

    if (productId !== undefined && !productId) {
      throw Object.assign(new Error("Product ID is required."), {
        code: "VALIDATION_ERROR",
        retryable: false
      });
    }
  }
}

export { FavoritesEndpoint };
