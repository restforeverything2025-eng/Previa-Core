/**
 * ============================================================
 * PREVIA Core
 * Memory Order Repository
 * ============================================================
 *
 * Temporary in-memory repository for testing.
 *
 * This implementation is NOT production storage.
 * It exists to verify Core independently from CMS.
 * ============================================================
 */

class MemoryOrderRepository {

  constructor() {

    this.orders = new Map();

  }


  save(order, items) {

    this.orders.set(
      order.order_id,
      {
        order,
        items
      }
    );

    return {
      order,
      items
    };

  }


  findById(orderId) {

    return this.orders.get(orderId) || null;

  }

}


export {
  MemoryOrderRepository
};