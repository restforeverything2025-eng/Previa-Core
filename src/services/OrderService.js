/**
 * ============================================================
 * PREVIA Core
 * Order Service
 * ============================================================
 *
 * Handles Order creation and preparation.
 *
 * Does not know about:
 * - Google Sheets
 * - Telegram
 * - payments
 * - reservations
 * - notifications
 * ============================================================
 */

import {
  Order,
  OrderItem
} from "../domain/index.js";

import {
  validate
} from "./ValidationService.js";


class OrderService {

  constructor(repository = null) {

    this.repository = repository;
  }


  createOrder(data = {}) {

    const errors =
      validate("order", data);

    if (errors.length > 0) {

      throw new Error(
        "Order validation failed: " +
        errors.join(", ")
      );

    }


    const order =
      new Order({
        ...data,

        created_at:
          data.created_at || new Date()
      });


    const items =
      (data.items || []).map(item => {

        return new OrderItem({
          order_id:
            order.order_id,

          sku:
            item.sku,

          title:
            item.title,

          price:
            item.price,

          quantity:
            item.quantity,

          subtotal:
            item.price * item.quantity
        });

      });


    const subtotal =
      items.reduce(
        (sum, item) => sum + item.subtotal,
        0
      );


    order.subtotal =
      subtotal;

    order.total =
      subtotal;


    return {
      order,
      items
    };
  }


  async saveOrder(data = {}) {

    const result =
      this.createOrder(data);


    if (!this.repository) {

      return result;
    }


    return this.repository.save(
      result.order,
      result.items
    );
  }

}


export {
  OrderService
};