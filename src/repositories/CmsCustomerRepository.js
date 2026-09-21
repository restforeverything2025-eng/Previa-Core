/**
 * ============================================================
 * PREVIA Core
 * CMS Customer Repository
 * ============================================================
 *
 * Persists customer records to PREVIA-CMS through the internal
 * HMAC-authenticated API.
 * ============================================================
 */

import { createHmacEnvelope } from "../utils/HmacUtils.js";
import { CustomerRepository } from "./CustomerRepository.js";

class CmsCustomerRepository extends CustomerRepository {
  constructor(cmsUrl, hmacSecret, transport = null) {
    super();
    this.cmsUrl = cmsUrl;
    this.hmacSecret = hmacSecret;
    this.transport = transport;
  }

  async findById(customerId) {
    return this._request("customer.find", { customerId });
  }

  async findByProvider(provider, providerId) {
    return this._request("customer.find", { provider, providerId });
  }

  async save(customer) {
    return this._request("customer.getOrCreate", {
      provider: customer.provider,
      providerId: customer.providerId,
      displayName: customer.displayName,
      username: customer.username
    });
  }

  async _request(action, data) {
    const envelope = createHmacEnvelope(action, data, this.hmacSecret);
    const response = this.transport
      ? await this.transport.post(envelope)
      : await this._post(envelope);

    if (!response || response.success !== true) {
      const error = new Error(
        response?.message || response?.code || "CMS customer operation failed"
      );
      error.code = response?.code || "PERSISTENCE_ERROR";
      error.retryable = response?.retryable || false;
      throw error;
    }

    return response.customer || null;
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

export { CmsCustomerRepository };
