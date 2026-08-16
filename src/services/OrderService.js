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

import { randomUUID } from "crypto";

import {
  Order,
  OrderItem
} from "../domain/index.js";

import {
  validate
} from "./ValidationService.js";

import {
  ORDER_DEFAULTS
} from "../constants/OrderDefaults.js";


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

    // Generate server-side order_id (ORD-<UUIDv4>)
    const orderId = "ORD-" + randomUUID();

    // Generate server-side created_at (ISO 8601 UTC)
    const createdAt = new Date().toISOString();

    // Create Order with server-generated values and defaults
    const order =
      new Order({
        ...data,

        order_id: orderId,

        created_at: createdAt,

        // Enforce defaults (app cannot override)
        source: ORDER_DEFAULTS.source,

        payment_type: ORDER_DEFAULTS.payment_type,

        order_status: ORDER_DEFAULTS.order_status,

        payment_status: ORDER_DEFAULTS.payment_status
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