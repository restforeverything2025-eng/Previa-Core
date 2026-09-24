/**
 * ============================================================
 * PREVIA Core
 * Customer Endpoint
 * ============================================================
 *
 * Application-facing adapter for customer identity operations.
 * Authentication is performed before this endpoint is called.
 * ============================================================
 */

class CustomerEndpoint {
  constructor(customerService) {
    if (!customerService) {
      throw new Error("Customer service is required.");
    }

    this.customerService = customerService;
  }

  async find(identity) {
    if (!identity || identity.provider === undefined || identity.providerId === undefined) {
      throw Object.assign(new Error("Customer identity is required."), {
        code: "VALIDATION_ERROR",
        retryable: false
      });
    }

    return this.customerService.findByProvider(
      identity.provider,
      identity.providerId
    );
  }

  async findById(customerId) {
    if (!customerId) {
      throw Object.assign(new Error("Customer ID is required."), {
        code: "VALIDATION_ERROR",
        retryable: false
      });
    }

    return this.customerService.findById(customerId);
  }

  async getOrCreate(identity) {
    if (!identity || identity.provider === undefined || identity.providerId === undefined) {
      throw Object.assign(new Error("Customer identity is required."), {
        code: "VALIDATION_ERROR",
        retryable: false
      });
    }

    return this.customerService.getOrCreate(identity);
  }
}

export { CustomerEndpoint };
