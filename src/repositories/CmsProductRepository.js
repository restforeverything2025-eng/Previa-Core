/**
 * ============================================================
 * PREVIA Core
 * CMS Product Repository
 * ============================================================
 *
 * Reads authoritative product data from PREVIA-CMS.
 * Used by Core before an order is created so client-supplied
 * title/price/status cannot be trusted.
 * ============================================================
 */

import { ProductRepository } from "./ProductRepository.js";

class CmsProductRepository extends ProductRepository {
  constructor(cmsUrl, transport = null) {
    super();
    this.cmsUrl = cmsUrl;
    this.transport = transport;
  }

  async findBySku(sku) {
    const normalizedSku = typeof sku === "string" ? sku.trim() : "";

    if (!normalizedSku) {
      return null;
    }

    const request = {
      action: "product.find",
      data: { sku: normalizedSku }
    };

    const response = await this._postToCms(request);

    if (!response || response.success !== true || !response.product) {
      return null;
    }

    return response.product;
  }

  async _postToCms(request) {
    if (this.transport) {
      return this.transport.post(request);
    }

    const response = await fetch(this.cmsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      const error = new Error(`CMS HTTP ${response.status}: ${response.statusText}`);
      error.code = "PERSISTENCE_ERROR";
      error.retryable = response.status >= 500;
      throw error;
    }

    const contentType = response.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      const error = new Error(`CMS returned non-JSON: ${text}`);
      error.code = "PERSISTENCE_ERROR";
      error.retryable = true;
      throw error;
    }

    return response.json();
  }
}

export { CmsProductRepository };
