/**
 * ============================================================
 * PREVIA Core
 * Memory Product Repository
 * ============================================================
 *
 * Temporary in-memory repository for testing.
 *
 * This implementation is NOT production storage.
 * It exists to verify Core independently from CMS.
 * ============================================================
 */

class MemoryProductRepository {

  constructor(products = []) {

    this.products = products;

  }


  findBySku(sku) {

    return (
      this.products.find(
        product => product.sku === sku
      ) || null
    );

  }

}


export {
  MemoryProductRepository
};
