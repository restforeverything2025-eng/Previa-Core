/**
 * ============================================================
 * PREVIA Core
 * Order HTTP Handler
 * ============================================================
 *
 * Application transport adapter for OrderEndpoint.
 *
 * Responsibilities:
 * - Accept HTTP-like request data
 * - Call OrderEndpoint
 * - Return HTTP-like response data
 *
 * Does NOT know about:
 * - Node HTTP server
 * - Google Sheets
 * - Telegram
 * - Browser UI
 *
 * ============================================================
 */

class OrderHttpHandler {

  /**
   * @param {Object} orderEndpoint - OrderEndpoint instance
   */
  constructor(orderEndpoint) {
    this.orderEndpoint = orderEndpoint;
  }


  /**
   * Handles an order creation request.
   *
   * Expected request:
   *
   * {
   *   method: "POST",
   *   body: { ...order data... }
   * }
   *
   * @param {Object} request
   * @returns {Promise<Object>}
   */
  async create(request = {}) {

    if (request.method && request.method !== "POST") {

      return {
        status: 405,
        body: {
          success: false,
          code: "METHOD_NOT_ALLOWED",
          retryable: false,
          message: "Only POST is allowed"
        }
      };

    }


    const body =
      request.body || {};


    const result =
      await this.orderEndpoint.create(body);


    return {
      status: result.success ? 200 : 400,
      body: result
    };

  }

}


export {
  OrderHttpHandler
};
