/**
 * ============================================================
 * PREVIA Core
 * Favorites Repository
 * ============================================================
 *
 * Persistence contract for customer favorites.
 * ============================================================
 */

class FavoritesRepository {
  async getAll(customerId) {
    throw new Error("FavoritesRepository.getAll() is not implemented");
  }

  async add(customerId, productId) {
    throw new Error("FavoritesRepository.add() is not implemented");
  }

  async remove(customerId, productId) {
    throw new Error("FavoritesRepository.remove() is not implemented");
  }
}

export { FavoritesRepository };
