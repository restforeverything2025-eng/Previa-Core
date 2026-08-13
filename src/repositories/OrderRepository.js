/**
 * ============================================================
 * PREVIA Core
 * Order Repository
 * ============================================================
 *
 * Defines the persistence contract for Orders.
 *
 * Core does not know where Orders are stored.
 * An external adapter must implement this contract.
 * ============================================================
 */

class OrderRepository {

  save(order, items) {

    throw new Error(
      "OrderRepository.save() is not implemented"
    );

  }


  findById(orderId) {

    throw new Error(
      "OrderRepository.findById() is not implemented"
    );

  }

}


export {
  OrderRepository
};