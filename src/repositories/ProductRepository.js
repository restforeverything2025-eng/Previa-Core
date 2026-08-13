/**
 * ============================================================
 * PREVIA Core
 * Product Repository
 * ============================================================
 *
 * Defines the persistence contract for Products.
 *
 * Core does not know where Products are stored.
 * An external adapter must implement this contract.
 * ============================================================
 */

class ProductRepository {

  findBySku(sku) {

    throw new Error(
      "ProductRepository.findBySku() is not implemented"
    );

  }

}


export {
  ProductRepository
};
