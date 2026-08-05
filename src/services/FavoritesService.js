/**
 * ============================================================
 * PREVIA Core
 * Favorites Service Interface
 * ============================================================
 */

class FavoritesService {

  /**
   * Returns all favorite product IDs.
   */
  getFavorites() {
    throw new Error("Not implemented.");
  }

  /**
   * Adds a product to favorites.
   */
  addFavorite(productId) {
    throw new Error("Not implemented.");
  }

  /**
   * Removes a product from favorites.
   */
  removeFavorite(productId) {
    throw new Error("Not implemented.");
  }

  /**
   * Checks whether a product is a favorite.
   */
  hasFavorite(productId) {
    throw new Error("Not implemented.");
  }

  /**
   * Synchronizes local favorites with a Customer.
   */
  syncFavorites(customerId) {
    throw new Error("Not implemented.");
  }

}

export {
  FavoritesService
};