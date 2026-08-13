/**
 * ============================================================
 * PREVIA Core
 * Product Service
 * ============================================================
 *
 * Handles Product retrieval through a repository.
 *
 * Does not know about:
 * - Google Sheets
 * - Telegram
 * - CMS
 * - storage implementation
 * ============================================================
 */

class ProductService {

  constructor(repository = null) {

    this.repository = repository;

  }


  findBySku(sku) {

    if (!this.repository) {

      throw new Error(
        "Product repository is required."
      );

    }


    return this.repository.findBySku(
      sku
    );

  }

}


export {
  ProductService
};
