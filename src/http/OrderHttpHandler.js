/**
 * PREVIA Core - Order HTTP Handler
 * Transport adapter for the public Order API.
 */

class OrderHttpHandler {
  constructor(orderEndpoint, identityVerifier = null, oidcVerifier = null, loginVerifier = null) {
    this.orderEndpoint = orderEndpoint;
    this.identityVerifier = identityVerifier;
    this.oidcVerifier = oidcVerifier;
    this.loginVerifier = loginVerifier;
  }

  async _authenticate(body) {
    if (body && typeof body.telegram_init_data === "string") {
      if (!this.identityVerifier) throw Object.assign(new Error("Identity verifier is not configured"), { code: "INTERNAL_ERROR", retryable: false });
      return await this.identityVerifier.verify(body.telegram_init_data);
    }
    if (body && typeof body.telegram_id_token === "string") {
      if (!this.oidcVerifier) throw Object.assign(new Error("Telegram OIDC verifier is not configured"), { code: "INTERNAL_ERROR", retryable: false });
      const options = {};
      if (typeof body.telegram_oidc_nonce === "string" && body.telegram_oidc_nonce.trim()) {
        options.nonce = body.telegram_oidc_nonce;
      }
      return await this.oidcVerifier.verify(body.telegram_id_token, options);
    }
    if (body && body.telegram_login && typeof body.telegram_login === "object") {
      if (!this.loginVerifier) throw Object.assign(new Error("Telegram Login verifier is not configured"), { code: "INTERNAL_ERROR", retryable: false });
      return await this.loginVerifier.verify(body.telegram_login);
    }
    throw Object.assign(new Error("Telegram authentication is required"), { code: "AUTHENTICATION_ERROR", retryable: false });
  }

  async create(request = {}) {
    if (request.method && request.method !== "POST") {
      return { status: 405, body: { success: false, code: "METHOD_NOT_ALLOWED", retryable: false, message: "Only POST is allowed" } };
    }
    const body = request.body || {};
    try {
      const identity = await this._authenticate(body);
      const { telegram_init_data, telegram_login, telegram_id_token, telegram_oidc_nonce, ...clientOrderData } = body;
      const orderData = { ...clientOrderData, provider: identity.provider, providerId: identity.providerId, telegram_username: identity.telegram_username, telegram_name: identity.telegram_name };
      const result = await this.orderEndpoint.create(orderData);
      console.log("PREVIA order endpoint result", { success: result?.success, code: result?.code || null, message: result?.message || null });
      return { status: this._statusForResult(result), body: result };
    } catch (error) {
      const code = error.code || "INTERNAL_ERROR";
      console.error("PREVIA order request failed", { code, message: error.message || "Order operation failed" });
      return { status: this._statusForCode(code), body: { success: false, code, retryable: error.retryable || false, message: error.message || "Order operation failed", ...(error.details ? { details: error.details } : {}) } };
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
