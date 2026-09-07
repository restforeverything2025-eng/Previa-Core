/**
 * ============================================================
 * PREVIA Core
 * Order Endpoint
 * ============================================================
 *
 * Application boundary for Order operations.
 * ============================================================
 */

class OrderEndpoint {
  constructor(orderService) {
    this.orderService = orderService;
  }

  async create(data = {}) {
    try {
      const result = await this.orderService.saveOrder(data);

      return {
        success: true,
        order_id: result.order.order_id,
        created_at: result.order.created_at
      };
    } catch (error) {
      return this._mapError(error);
    }
  }

  _mapError(error) {
    if (error.code) {
      return {
        success: false,
        code: error.code,
        retryable: error.retryable || false,
        message: error.message || "Order operation failed",
        details: error.details || []
      };
    }

    return {
      success: false,
      code: "INTERNAL_ERROR",
      retryable: false,
      message: "Order operation failed"
    };
  }
}

export {
  OrderEndpoint
};
