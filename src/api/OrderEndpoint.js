/**
 * ============================================================
 * PREVIA Core
 * Order Endpoint
 * ============================================================
 *
 * Application boundary for Order operations.
 *
 * Responsibilities:
 * - Accept order input from an external client layer
 * - Call OrderService
 * - Convert domain/service results into API-safe responses
 *
 * Does NOT know about:
 * - HTTP server
 * - Google Sheets
 * - Telegram
 * - UI
 *
 * ============================================================
 */

class OrderEndpoint {

  /**
   * @param {Object} orderService - OrderService instance
   */
  constructor(orderService) {
    this.orderService = orderService;
  }


  /**
   * Creates and persists an order.
   *
   * @param {Object} data - Order creation input
   * @returns {Promise<Object>} API response
   */
  async create(data = {}) {

    try {

      const result =
        await this.orderService.saveOrder(data);


      return {
        success: true,

        order_id:
          result.order.order_id,

        created_at:
          result.order.created_at
      };

    } catch (error) {

      return this._mapError(error);

    }

  }


  /**
   * Maps service/repository errors into API-safe responses.
   *
   * @private
   * @param {Error} error
   * @returns {Object}
   */
  _mapError(error) {

    // Known CMS/repository error
    if (error.code) {

      return {
        success: false,

        code:
          error.code,

        retryable:
          error.retryable || false,

        message:
          error.message || "Order operation failed"
      };

    }


    // Validation/service error
    return {
      success: false,

      code: "VALIDATION_ERROR",

      retryable: false,

      message:
        error.message || "Order validation failed"
    };

  }

}


export {
  OrderEndpoint
};
