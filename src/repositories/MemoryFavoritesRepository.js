/**
 * ============================================================
 * PREVIA Core
 * Memory Favorites Repository
 * ============================================================
 *
 * Test-only favorites repository.
 * ============================================================
 */

class MemoryFavoritesRepository {
  constructor(records = []) {
    this.records = [...records];
  }

  async getAll(customerId) {
    return this.records.filter(
      item => item.customerId === String(customerId)
    );
  }

  async add(customerId, productId) {
    const normalizedCustomerId = String(customerId);
    const normalizedProductId = String(productId);

    const existing = this.records.find(
      item =>
        item.customerId === normalizedCustomerId &&
        item.productId === normalizedProductId
    );

    if (existing) {
      return existing;
    }

    const favorite = {
      customerId: normalizedCustomerId,
      productId: normalizedProductId,
      createdAt: new Date().toISOString()
    };

    this.records.push(favorite);
    return favorite;
  }

  async remove(customerId, productId) {
    const normalizedCustomerId = String(customerId);
    const normalizedProductId = String(productId);
    const before = this.records.length;

    this.records = this.records.filter(
      item => !(
        item.customerId === normalizedCustomerId &&
        item.productId === normalizedProductId
      )
    );

    return this.records.length !== before;
  }
}

export { MemoryFavoritesRepository };
