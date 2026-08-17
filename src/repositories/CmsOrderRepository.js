/**
 * ============================================================
 * PREVIA Core
 * CMS Order Repository
 * ============================================================
 *
 * Persists orders to Previa-CMS via HTTP + HMAC authentication.
 * Implements OrderRepository contract.
 *
 * Does NOT retry automatically.
 * Caller decides retry based on error.retryable.
 *
 * ============================================================
 */

import { OrderRepository } from "./OrderRepository.js";
import { createHmacEnvelope } from "../utils/HmacUtils.js";

class CmsOrderRepository extends OrderRepository {
  /**
   * @param {string} cmsUrl - CMS endpoint URL
   * @param {string} hmacSecret - HMAC secret for signing
   * @param {Object|null} transport - Optional fake transport for testing
   */
  constructor(cmsUrl, hmacSecret, transport = null) {
    super();

    this.cmsUrl = cmsUrl;
    this.hmacSecret = hmacSecret;
    this.transport = transport;
  }

  /**
   * Creates order in CMS.
   *
   * @param {Object} order
   * @param {Array} items
   * @returns {Promise<{order, items}>}
   */
  async save(order, items) {
    const envelope = createHmacEnvelope(
      "order.create",
      { order, items },
      this.hmacSecret
    );

    const response = await this._postToCms(envelope);

    // CMS returns structured error responses with success=false.
    if (response && response.success === false) {
      const error = new Error(
        response.message || response.code || "CMS order creation failed"
      );

      error.code = response.code;
      error.retryable = response.retryable || false;

      throw error;
    }

    // Successful order.create response contains persisted order and items.
    return {
      order: response.order,
      items: response.items
    };
  }

  /**
   * Finds order by ID in CMS.
   *
   * CMS contract:
   * - { order, items } when found
   * - null when not found
   * - { success:false, code:..., ... } on error
   *
   * @param {string} orderId
   * @returns {Promise<{order, items}|null>}
   */
  async findById(orderId) {
    const envelope = createHmacEnvelope(
      "order.find",
      { order_id: orderId },
      this.hmacSecret
    );

    const response = await this._postToCms(envelope);

    // CMS returns null when order is not found.
    if (response === null) {
      return null;
    }

    // CMS returns structured error responses with success=false.
    if (response && response.success === false) {
      const error = new Error(
        response.message || response.code || "CMS order lookup failed"
      );

      error.code = response.code;
      error.retryable = response.retryable || false;

      throw error;
    }

    // Successful order.find response is { order, items }.
    return {
      order: response.order,
      items: response.items
    };
  }

  /**
   * Posts signed envelope to CMS.
   *
   * @private
   * @param {Object} envelope
   * @returns {Promise<Object|null>}
   */
  async _postToCms(envelope) {
    // Fake transport is used by manual tests.
    if (this.transport) {
      return this.transport.post(envelope);
    }

    const fetchOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(envelope),
      signal: AbortSignal.timeout(10000)
    };

    try {
      const response = await fetch(this.cmsUrl, fetchOptions);

      if (!response.ok) {
        throw new Error(
          `CMS HTTP ${response.status}: ${response.statusText}`
        );
      }

      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();

        throw new Error(
          `CMS returned non-JSON: ${text}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error.name === "AbortError") {
        const timeoutError = new Error(
          "CMS_TIMEOUT: Request exceeded 10 seconds"
        );

        timeoutError.code = "CMS_TIMEOUT";
        timeoutError.retryable = true;

        throw timeoutError;
      }

      throw error;
    }
  }
}

export { CmsOrderRepository };