/**
 * PREVIA Core - Order HTTP Handler
 * Transport adapter for the public Order API.
 */

class OrderHttpHandler {
  constructor(orderEndpoint, identityVerifier = null) {
    this.orderEndpoint = orderEndpoint;
    this.identityVerifier = identityVerifier;
  }

  async create(request = {}) {
    if (request.method && request.method !== "POST") {
      return { status: 405, body: { success: false, code: "METHOD_NOT_ALLOWED", retryable: false, message: "Only POST is allowed" } };
    }

    const body = request.body || {};

    try {
      if (!this.identityVerifier) {
        throw Object.assign(new Error("Identity verifier is not configured"), { code: "INTERNAL_ERROR", retryable: false });
      }

      const identity = this.identityVerifier.verify(body.telegram_init_data);
      const {
        telegram_init_data,
        ...clientOrderData
      } = body;

      const orderData = {
        ...clientOrderData,
        provider: identity.provider,
        providerId: identity.providerId,
        telegram_username: identity.telegram_username,
        telegram_name: identity.telegram_name
      };

      const result = await this.orderEndpoint.create(orderData);

      return { status: this._statusForResult(result), body: result };
    } catch (error) {
      const code = error.code || "INTERNAL_ERROR";

      // Safe production diagnostic: never log Telegram initData, bot token,
      // customer data, order payload, or other secrets.
      console.error("PREVIA order request failed", {
        code,
        message: error.message || "Order operation failed"
      });

      return {
        status: this._statusForCode(code),
        body: { success: false, code, retryable: error.retryable || false, message: error.message || "Order operation failed", ...(error.details ? { details: error.details } : {}) }
      };
    }
  }

  _statusForResult(result) { return result.success ? 200 : this._statusForCode(result.code); }

  _statusForCode(code) {
    if (code === "AUTHENTICATION_ERROR") return 401;
    if (code === "METHOD_NOT_ALLOWED") return 405;
    if (code === "VALIDATION_ERROR") return 400;
    if (code === "IDEMPOTENCY_CONFLICT") return 409;
    if (code === "CMS_TIMEOUT") return 504;
    if (code === "PERSISTENCE_ERROR") return 502;
    if (code === "INTERNAL_ERROR") return 500;
    return 400;
  }
}

export { OrderHttpHandler };
