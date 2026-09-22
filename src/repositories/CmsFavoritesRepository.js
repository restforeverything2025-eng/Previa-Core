/**
 * ============================================================
 * PREVIA Core
 * CMS Favorites Repository
 * ============================================================
 *
 * Persists customer favorites to PREVIA-CMS through the internal
 * HMAC-authenticated API.
 * ============================================================
 */

import { createHmacEnvelope } from "../utils/HmacUtils.js";
import { FavoritesRepository } from "./FavoritesRepository.js";

class CmsFavoritesRepository extends FavoritesRepository {
  constructor(cmsUrl, hmacSecret, transport = null) {
    super();
    this.cmsUrl = cmsUrl;
    this.hmacSecret = hmacSecret;
    this.transport = transport;
  }

  async getAll(customerId) {
    const response = await this._request("favorites.get", { customerId });
    return response?.favorites || [];
  }

  async add(customerId, productId) {
    const response = await this._request("favorites.add", {
      customerId,
      productId
    });
    return response?.favorite || null;
  }

  async remove(customerId, productId) {
    const response = await this._request("favorites.remove", {
      customerId,
      productId
    });
    return response?.removed ?? false;
  }

  async _request(action, data) {
    const envelope = createHmacEnvelope(action, data, this.hmacSecret);
    const response = this.transport
      ? await this.transport.post(envelope)
      : await this._post(envelope);

    if (!response || response.success !== true) {
      const error = new Error(
        response?.message || response?.code || "CMS favorites operation failed"
      );
      error.code = response?.code || "PERSISTENCE_ERROR";
      error.retryable = response?.retryable || false;
      throw error;
    }

    return response;
  }

  async _post(envelope) {
    const response = await fetch(this.cmsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(envelope),
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
      const error = new Error("CMS returned non-JSON response");
      error.code = "PERSISTENCE_ERROR";
      error.retryable = true;
      throw error;
    }

    return response.json();
  }
}

export { CmsFavoritesRepository };
