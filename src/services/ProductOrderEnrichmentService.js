/**
 * ============================================================
 * PREVIA Core
 * Product Order Enrichment Service
 * ============================================================
 *
 * Resolves every order item against the authoritative product
 * repository. Client title/price values are never trusted.
 * ============================================================
 */

class ProductOrderEnrichmentService {
  constructor(productRepository) {
    if (!productRepository || typeof productRepository.findBySku !== "function") {
      throw new Error("Product repository is required");
    }

    this.productRepository = productRepository;
  }

  async enrichItems(items = []) {
    const enrichedItems = [];

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const product = await this.productRepository.findBySku(item?.sku);

      if (!product) {
        this._throwValidation(
          `items[${index}]: sku '${item?.sku || ""}' was not found`
        );
      }

      if (String(product.status || "").trim().toLowerCase() !== "available") {
        this._throwValidation(
          `items[${index}]: sku '${item.sku}' is not available`
        );
      }

      const price = Number(product.price);
      if (!Number.isFinite(price) || price <= 0) {
        this._throwValidation(
          `items[${index}]: authoritative price for sku '${item.sku}' is invalid`
        );
      }

      const title = String(product.name || product.title || "").trim();
      if (!title) {
        this._throwValidation(
          `items[${index}]: authoritative title for sku '${item.sku}' is missing`
        );
      }

      enrichedItems.push({
        sku: item.sku,
        title,
        price,
        quantity: 1
      });
    }

    return enrichedItems;
  }

  _throwValidation(message) {
    const error = new Error(`Order validation failed: ${message}`);
    error.code = "VALIDATION_ERROR";
    error.retryable = false;
    error.details = [message];
    throw error;
  }
}

export { ProductOrderEnrichmentService };
