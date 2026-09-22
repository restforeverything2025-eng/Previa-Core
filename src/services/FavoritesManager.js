/**
 * ============================================================
 * PREVIA Core
 * Favorites Manager
 * ============================================================
 *
 * Coordinates customer favorites through a persistence adapter.
 * Client-side local storage remains a client concern.
 * ============================================================
 */

class FavoritesManager {
  constructor(repository) {
    if (!repository) {
      throw new Error("Favorites repository is required.");
    }

    this.repository = repository;
  }

  async getFavorites(customerId) {
    return this.repository.getAll(customerId);
  }

  async addFavorite(customerId, productId) {
    return this.repository.add(customerId, productId);
  }

  async removeFavorite(customerId, productId) {
    return this.repository.remove(customerId, productId);
  }

  async syncFavorites(customerId, localProductIds = []) {
    const cloudFavorites = await this.getFavorites(customerId);
    const cloudIds = new Set(
      (cloudFavorites || []).map(item => String(item.productId ?? item.product_id))
    );

    const localIds = Array.from(new Set(
      (Array.isArray(localProductIds) ? localProductIds : [])
        .filter(Boolean)
        .map(String)
    ));

    for (const productId of localIds) {
      if (!cloudIds.has(productId)) {
        await this.addFavorite(customerId, productId);
      }
    }

    return this.getFavorites(customerId);
  }
}

export { FavoritesManager };
