/**
 * ============================================================
 * PREVIA Core
 * CMS Order Repository
 * ============================================================
 *
 * Persists orders to Previa-CMS via HTTP + HMAC authentication.
 * ============================================================
 */

import { createHash } from "node:crypto";
import { OrderRepository } from "./OrderRepository.js";
import { createHmacEnvelope } from "../utils/HmacUtils.js";

function secretFingerprint(secret) {
  return createHash("sha256")
    .update(String(secret || ""), "utf8")
    .digest("hex")
    .slice(0, 16);
}

class CmsOrderRepository extends OrderRepository {
  constructor(cmsUrl, hmacSecret, transport = null) {
    super();
    this.cmsUrl = cmsUrl;
    this.hmacSecret = hmacSecret;
    this.transport = transport;
  }

  async save(order, items) {
    const envelope = createHmacEnvelope(
      "order.create",
      { order, items },
      this.hmacSecret
    );

    console.log("PREVIA CMS HMAC request", {
      action: envelope.action,
      cms_url: this.cmsUrl,
      secret_length: String(this.hmacSecret || "").length,
      secret_fingerprint: secretFingerprint(this.hmacSecret),
      payload_length: envelope.payload.length,
      timestamp: envelope.auth.timestamp,
      nonce_length: envelope.auth.nonce.length,
      signature_length: envelope.auth.signature.length
    });

    const response = await this._postToCms(envelope);

    console.log("PREVIA CMS response", {
      success: response?.success,
      code: response?.code || null,
      message: response?.message || null,
      has_order: Boolean(response?.order)
    });

    if (!response || response.success !== true) {
      const error = new Error(
        response?.message || response?.code || "CMS order creation failed"
      );
      error.code = response?.code || "PERSISTENCE_ERROR";
      error.retryable = response?.retryable || false;
      error.details = response?.errors || response?.details || [];
      throw error;
    }

    // CMS intentionally returns an acknowledgement only.
    // Core keeps the canonical generated order object.
    return {
      order,
      items
    };
  }

  async findById(orderId) {
    const envelope = createHmacEnvelope(
      "order.find",
      { order_id: orderId },
      this.hmacSecret
    );

    const response = await this._postToCms(envelope);

    if (response === null || response?.success === true && !response.order) {
      return null;
    }

    if (response && response.success === false) {
      const error = new Error(
        response.message || response.code || "CMS order lookup failed"
      );
      error.code = response.code || "PERSISTENCE_ERROR";
      error.retryable = response.retryable || false;
      error.details = response.errors || response.details || [];
      throw error;
    }

    return {
      order: response.order,
      items: response.items || []
    };
  }

  async _postToCms(envelope) {
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

      console.log("PREVIA CMS HTTP response", {
        status: response.status,
        status_text: response.statusText,
        content_type: response.headers.get("content-type"),
        location_present: Boolean(response.headers.get("location"))
      });

      if (!response.ok) {
        const error = new Error(
          `CMS HTTP ${response.status}: ${response.statusText}`
        );
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
